pragma solidity ^0.8.3;

contract Greeter {
    string private greet = "Hello, World!";

    function getGreet() public view returns (string memory) {
        return  greet;
    }
    function setGreet(string memory _greet) public {
        greet=_greet;
    }
}