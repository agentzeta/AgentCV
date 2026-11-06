// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title EvalAttestationRegistry
/// @notice Makes an AI-agent evaluation result tamper-evident on-chain. Anyone can attest;
/// each run can be attested once. The contract stores the attester, the agent, a hash of the
/// full off-chain result payload, the score, a timestamp and a URI. It does NOT judge or verify
/// the evaluation — it fixes a result so it cannot be quietly edited afterward.
contract EvalAttestationRegistry {
    struct Attestation {
        address attester;
        address agent;
        bytes32 resultHash;
        uint32 passed;
        uint32 total;
        uint64 timestamp;
        string uri;
    }

    mapping(bytes32 => Attestation) private _byRun; // runId => attestation
    uint256 public count;

    event Attested(
        bytes32 indexed runId,
        address indexed agent,
        address indexed attester,
        bytes32 resultHash,
        uint32 passed,
        uint32 total,
        string uri
    );

    error AlreadyAttested(bytes32 runId);
    error InvalidScore();

    /// @param runId    unique id of the evaluation run (e.g. keccak256 of the app run id)
    /// @param agent    address the evaluated agent is associated with (may be zero if none)
    /// @param resultHash keccak256 of the canonical off-chain result payload
    function attest(
        bytes32 runId,
        address agent,
        bytes32 resultHash,
        uint32 passed,
        uint32 total,
        string calldata uri
    ) external {
        if (_byRun[runId].attester != address(0)) revert AlreadyAttested(runId);
        if (total == 0 || passed > total) revert InvalidScore();
        _byRun[runId] = Attestation(msg.sender, agent, resultHash, passed, total, uint64(block.timestamp), uri);
        unchecked { count++; }
        emit Attested(runId, agent, msg.sender, resultHash, passed, total, uri);
    }

    function getAttestation(bytes32 runId) external view returns (Attestation memory) {
        return _byRun[runId];
    }

    function isAttested(bytes32 runId) external view returns (bool) {
        return _byRun[runId].attester != address(0);
    }
}
