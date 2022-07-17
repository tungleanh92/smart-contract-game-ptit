// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface PtitToken_Interface {
    function totalSupply() external returns (uint256);

    function mint(address, uint256) external;

    function transfer(address, uint256) external;

    function transferFrom(
        address,
        address,
        uint256
    ) external;
}

contract Vault is Ownable {
    PtitToken_Interface public PtitToken;
    uint24 public mintMax;
    uint256 public mintAmt;

    // --- Auth ---
    mapping(address => uint256) public checks;

    function grantPermit(address admin) external auth {
        checks[admin] = 1;
    }

    function unGrantPermit(address admin) external auth {
        checks[admin] = 0;
    }

    modifier auth() {
        require(checks[msg.sender] == 1, "vault/not-authorized");
        _;
    }

    event faucet(address faucet, address player, uint256 amount);
    event joingame(address player, uint256 amount);
    event claimtoken(address player, uint256 amount);
    event withdrawtoken(address player, uint256 amount);
    event deposittoken(address player, uint256 amount);

    // -- Number of Mint Control ---
    mapping(address => uint24) public mintTime;
    mapping(address => uint256) public playerBalance;

    constructor(address _PtitToken) {
        checks[msg.sender] = 1;
        PtitToken = PtitToken_Interface(_PtitToken);
    }

    function setMintTime(uint24 _amt) public onlyOwner {
        mintMax = _amt;
    }

    function setMintAmount(uint256 _amt) public onlyOwner {
        mintAmt = _amt;
    }

    function viewPlayersBalance() public view returns (uint256) {
        return playerBalance[msg.sender];
    }

    function faucetClaim(address usr) external {
        require(
            mintTime[msg.sender] < mintMax,
            "Exceed Amount Of Minting Time"
        );
        mintTime[msg.sender] += 1;
        PtitToken.mint(address(this), mintAmt);
        playerBalance[usr] += mintAmt;
        emit faucet(address(0), usr, mintAmt);
    }

    function joinGame(address _user, uint256 _amt)
        external
        auth
        returns (bool)
    {
        require(
            playerBalance[_user] >= _amt,
            "Dont have enough balance to withdraw"
        );
        playerBalance[_user] -= _amt;
        emit joingame(_user, _amt);
        return true;
    }

    function claimToken(address _user, uint256 _amt) external auth {
        playerBalance[_user] += _amt;
        emit claimtoken(_user, _amt);
    }

    function withdrawToken(uint256 _amt) public returns (bool) {
        require(
            playerBalance[msg.sender] >= _amt,
            "Dont have enough balance to withdraw"
        );
        playerBalance[msg.sender] -= _amt;
        PtitToken.transfer(msg.sender, _amt);
        emit withdrawtoken(msg.sender, _amt);
        return true;
    }

    function depositToken(uint256 _amt) public {
        PtitToken.transferFrom(msg.sender, address(this), _amt);
        playerBalance[msg.sender] += _amt;
        emit deposittoken(msg.sender, _amt);
    }

    function removeOtherERC20Tokens(address _tokenAddress, address _to)
        public
        onlyOwner
    {
        require(
            _tokenAddress != address(PtitToken),
            "Token Address has to be diff than the PtitToken"
        ); // Confirm tokens addresses are different from main sale one
        require(
            IERC20(_tokenAddress).transfer(
                _to,
                IERC20(_tokenAddress).balanceOf(address(this))
            ),
            "ERC20 Token transfer failed"
        );
    }
}