// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

interface Vault_Interface {
    function playerBalance(address) external returns (uint256);

    function joinGame(address, uint256) external;

    function claimToken(address, uint256) external;
}

contract NonCompetitiveGameA is Ownable {
    struct GamePlay {
        uint256 amount;
        bool claimed;
        address player;
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
    event playerclaimback(address winner, uint256 amount);

    mapping(uint256 => GamePlay) public gamePlayID;

    constructor(address _Vault) {
        Vault = Vault_Interface(_Vault);
    }

    function setVerification(address _a) public onlyOwner {
        verification = _a;
    }

    function viewPlayersBalance() public returns (uint256) {
        return Vault.playerBalance(msg.sender);
    }

    function joinGame(uint256 _amt, uint256 _id) public {
        require(
            Vault.playerBalance(msg.sender) >= _amt,
            "Dont have enough balance to withdraw"
        );
        GamePlay storage gp = gamePlayID[_id];

        Vault.joinGame(msg.sender, _amt);
            
        gp.player = msg.sender;
        gp.amount = _amt;
        emit joingame(_id, _amt, msg.sender, block.timestamp);
    }

    function winnerClaim(
        uint256 _id,
        uint256 _reward,
        bytes memory _signature,
        bytes32 _messageHash
    ) public {
        (bytes32 r, bytes32 s, uint8 v) = splitSignature(_signature);
        bytes32 _ethSignedMessageHash = getEthSignedMessageHash(_messageHash);
        address recoverAddress = ecrecover(_ethSignedMessageHash, v, r, s);

        GamePlay memory gp = gamePlayID[_id];
        require(gp.claimed != true, "Already Claim Reward");
        require(gp.player == msg.sender, "you are not owner");
        gamePlayID[_id].claimed = true;
        require(recoverAddress == verification, "you are not game provider");
        
        Vault.claimToken(gp.player, _reward);
        emit winnerclaim(gp.player, _reward);
    }

    function playerClaimBack(
        uint256 _id,
        bytes memory _signature,
        bytes32 _messageHash
    ) public {
        (bytes32 r, bytes32 s, uint8 v) = splitSignature(_signature);
        bytes32 _ethSignedMessageHash = getEthSignedMessageHash(_messageHash);
        address recoverAddress = ecrecover(_ethSignedMessageHash, v, r, s);
        GamePlay memory gp = gamePlayID[_id];
        require(gp.claimed != true, "Already Claim Reward");
        gamePlayID[_id].claimed = true;
        require(recoverAddress == verification, "you are not game provider");
        require(gp.player == msg.sender, "you are not owner");
        // ?
        Vault.claimToken(gp.player, gp.amount);
        emit playerclaimback(gp.player, gp.amount);
    }

    function getEthSignedMessageHash(bytes32 _messageHash)
        internal
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
        internal
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

// balance sau cong tru bi loi
// joinGame cua Vault

// mint -> approve(vault address) -> deposit -> withdraw
// setMintAmount -> grantPermit(vault address) -> faucetClaim
// deposit -> approve(game address) ->  setVerification(own address) ->joinGame