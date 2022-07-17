// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0;

contract Multiply7 {
    uint public numb = 1;
    event Print(uint);
    function multiply(uint input) public returns (uint) {
        numb = input * 7;
        emit Print(numb);
        return numb;
    }
}