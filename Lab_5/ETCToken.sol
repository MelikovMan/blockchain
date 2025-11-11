pragma solidity ^0.8.30;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
contract GLDToken is ERC20 {
constructor(uint256 initialSupply) ERC20("Gold", "GLD") public {
_mint(msg.sender, initialSupply*10**uint256(18));
}
}