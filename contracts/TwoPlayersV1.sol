// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

interface Vault_Interface {
    function playerBalance(address) external returns (uint256);

    function joinGame(address, uint256) external returns (bool);

    function claimToken(address, uint256) external;
}

contract TwoPlayersV1 is Ownable {
    struct GamePlay {
        uint256 amount;
        address[] players;
        bool winClaimed;
        mapping(address => bool) tieClaimed;
    }

    Vault_Interface public Vault;
    address public verification;

    event joingame(
        uint256 playID,
        uint256 amount,
        address player,
        uint256 time
    );

    event winnerclaim(address winner, uint256 amount);
    event playerclaimback(address player, uint256 amount);

    mapping(uint256 => GamePlay) public gamePlayID;

    constructor(address _Vault) {
        Vault = Vault_Interface(_Vault);
    }

    // Address of Game Provider (set by admin)
    function setVerification(address _a) public onlyOwner {
        verification = _a;
    }

    // _messageHash is generated randomly from server
    // _signature is generated by game provider private key, which is stored in server
    // this one is needed to avoid EOA mess up with the system
    // _id is generated from server in order (1,2,3,4 ...)
    function joinGame(
        uint256 _amt,
        uint256 _id,
        bytes memory _signature,
        bytes32 _messageHash
    ) public {
        (bytes32 r, bytes32 s, uint8 v) = splitSignature(_signature);
        bytes32 _ethSignedMessageHash = getEthSignedMessageHash(_messageHash);
        address recoverAddress = ecrecover(_ethSignedMessageHash, v, r, s);
        require(recoverAddress == verification, "Not Allow");
        require(
            Vault.playerBalance(msg.sender) >= _amt,
            "Dont have enough balance to withdraw"
        );
        GamePlay storage gp = gamePlayID[_id];
        require(Vault.joinGame(msg.sender, _amt), "Not Allow");
        require(gp.players.length <= 2, "Exceed amount of players");
        gp.players.push(msg.sender);
        gp.amount = _amt;
        emit joingame(_id, _amt, msg.sender, block.timestamp);
    }

    function viewPlayer(uint256 _id)
        public
        view
        returns (address[] memory players)
    {
        players = gamePlayID[_id].players;
        return players;
    }

    // _id is from server, which is stored in DB after player click joinGame
    // _signature and _messageHash are from loser, which are stored in DB after player click joinGame
    // _winner is from server; _winner is byte type, hence must be converted to address type in Smart Contract
    function winnerClaim(
        uint256 _id,
        bytes memory _signature,
        bytes32 _messageHash,
        bytes memory _winner
    ) public {
        (bytes32 r, bytes32 s, uint8 v) = splitSignature(_signature);
        bytes32 _ethSignedMessageHash = getEthSignedMessageHash(_messageHash);
        address recoverAddress = ecrecover(_ethSignedMessageHash, v, r, s);
        GamePlay storage gp = gamePlayID[_id];
        require(gp.winClaimed != true, "Already Claim Reward");
        gp.winClaimed = true;
        address winner = bytesToAddress(_winner);
        for (uint8 i = 0; i < 2; i++) {
            if (recoverAddress != winner) {
                Vault.claimToken(winner, 2 * gp.amount); // 2 * gp.amount: take back from original deposit + from loser
                break;
            }
        }
        emit winnerclaim(winner, gp.amount);
    }

    // game tie
    // _id is from server, which is stored in DB after player clicks joinGame
    function playerClaimBack(uint256 _id) public {
        GamePlay storage gp = gamePlayID[_id];
        require(gp.tieClaimed[msg.sender] != true, "Already Claim Reward");
        require(
            gp.players[0] == msg.sender || gp.players[1] == msg.sender,
            "Not Allow"
        );
        gp.tieClaimed[msg.sender] = true;
        Vault.claimToken(msg.sender, gp.amount);
        emit playerclaimback(msg.sender, gp.amount);
    }

    function bytesToAddress(bytes memory b) public pure returns (address addr) {
        assembly {
            addr := mload(add(b, 20))
        }
    }

    function getEthSignedMessageHash(bytes32 _messageHash)
        public
        pure
        returns (bytes32)
    {
        return
            keccak256(
                abi.encodePacked(
                    "\x19Ethereum Signed Message:\n32",
                    _messageHash
                )
            );
    }

    function splitSignature(bytes memory sig)
        public
        pure
        returns (
            bytes32 r,
            bytes32 s,
            uint8 v
        )
    {
        require(sig.length == 65, "invalid signature length");
        assembly {
            r := mload(add(sig, 32))
            s := mload(add(sig, 64))
            v := byte(0, mload(add(sig, 96)))
        }
    }
}
