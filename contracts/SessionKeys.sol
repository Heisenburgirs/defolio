// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

interface IUniversalProfile {
    function execute(uint256 operationType, address target, uint256 value, bytes calldata data) external;
    function executeBatch(uint256[] calldata operationTypes, address[] calldata targets, uint256[] calldata values, bytes[] calldata datas) external;
}

contract SessionContract is Ownable {
    struct Session {
        uint256 startTime;
        uint256 duration;
    }

    address[] public grantedSessionAddresses;

    mapping(address => Session) public sessions;
    mapping(address => bool) private addressAdded;

    IUniversalProfile public universalProfile;

    constructor() Ownable(msg.sender) {
        universalProfile = IUniversalProfile(msg.sender);
    }

    receive() external payable {}

    fallback() external payable {}

    function grantSession(address delegate, uint256 durationInSeconds) public onlyOwner {
        require(durationInSeconds > 0, "Duration must be greater than 0");
        if (!addressAdded[delegate]) {
            grantedSessionAddresses.push(delegate);
            addressAdded[delegate] = true;
        }
        sessions[delegate] = Session(block.timestamp, durationInSeconds);
    }

    function updateSessionDuration(address delegate, uint256 newDurationInSeconds) public onlyOwner {
        require(sessions[delegate].startTime != 0, "Session does not exist");
        sessions[delegate] = Session(block.timestamp, newDurationInSeconds);
    }

    function execute(uint256 operationType, address target, uint256 value, bytes calldata data) external {
        require(isSessionActive(msg.sender), "Session expired or not existent");
        (bool success, ) = address(universalProfile).call(
            abi.encodeWithSignature("execute(uint256,address,uint256,bytes)", operationType, target, value, data)
        );
        require(success, "UniversalProfile execute failed");
    }

    function executeBatch(uint256[] calldata operationTypes, address[] calldata targets, uint256[] calldata values, bytes[] calldata datas) external {
        require(isSessionActive(msg.sender), "Session expired or not existent");
        (bool success, ) = address(universalProfile).call(
            abi.encodeWithSignature("executeBatch(uint256[],address[],uint256[],bytes[])", operationTypes, targets, values, datas)
        );
        require(success, "UniversalProfile executeBatch failed");
    }

    function isSessionActive(address delegate) private view returns (bool) {
        Session memory session = sessions[delegate];
        return block.timestamp <= session.startTime + session.duration;
    }

    function getAllGrantedSessionAddresses() public view returns (address[] memory) {
        return grantedSessionAddresses;
    }
}
