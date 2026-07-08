#![cfg(test)]
use super::*;
use soroban_sdk::testutils::Address as _;
use soroban_sdk::{Env, String};

#[test]
fn test_log_access_grant() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(AccessLogContract, ());
    let client = AccessLogContractClient::new(&env, &contract_id);

    let patient = Address::generate(&env);
    let doctor = Address::generate(&env);

    let count = client.log_access(
        &patient,
        &doctor,
        &String::from_str(&env, "grant"),
    );
    assert_eq!(count, 1);
    assert_eq!(client.get_total_events(), 1);
}

#[test]
fn test_log_access_revoke() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(AccessLogContract, ());
    let client = AccessLogContractClient::new(&env, &contract_id);

    let patient = Address::generate(&env);
    let doctor = Address::generate(&env);

    client.log_access(&patient, &doctor, &String::from_str(&env, "grant"));
    let count = client.log_access(
        &patient,
        &doctor,
        &String::from_str(&env, "revoke"),
    );
    assert_eq!(count, 2);
    assert_eq!(client.get_total_events(), 2);
}

#[test]
fn test_get_access_log() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(AccessLogContract, ());
    let client = AccessLogContractClient::new(&env, &contract_id);

    let patient = Address::generate(&env);
    let doctor1 = Address::generate(&env);
    let doctor2 = Address::generate(&env);

    client.log_access(&patient, &doctor1, &String::from_str(&env, "grant"));
    client.log_access(&patient, &doctor2, &String::from_str(&env, "grant"));
    client.log_access(&patient, &doctor1, &String::from_str(&env, "revoke"));

    let events = client.get_access_log(&patient);
    assert_eq!(events.len(), 3);

    let first = events.get(0).unwrap();
    assert_eq!(first.action, String::from_str(&env, "grant"));
    assert_eq!(first.accessor, doctor1);

    let last = events.get(2).unwrap();
    assert_eq!(last.action, String::from_str(&env, "revoke"));
}

#[test]
fn test_multiple_patients_independent_logs() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(AccessLogContract, ());
    let client = AccessLogContractClient::new(&env, &contract_id);

    let patient1 = Address::generate(&env);
    let patient2 = Address::generate(&env);
    let doctor = Address::generate(&env);

    client.log_access(&patient1, &doctor, &String::from_str(&env, "grant"));
    client.log_access(&patient2, &doctor, &String::from_str(&env, "grant"));
    client.log_access(&patient1, &doctor, &String::from_str(&env, "revoke"));

    assert_eq!(client.get_event_count(&patient1), 2);
    assert_eq!(client.get_event_count(&patient2), 1);
    assert_eq!(client.get_total_events(), 3);
}

#[test]
fn test_empty_access_log() {
    let env = Env::default();
    let contract_id = env.register(AccessLogContract, ());
    let client = AccessLogContractClient::new(&env, &contract_id);

    let patient = Address::generate(&env);
    let events = client.get_access_log(&patient);
    assert_eq!(events.len(), 0);
    assert_eq!(client.get_event_count(&patient), 0);
    assert_eq!(client.get_total_events(), 0);
}

#[test]
fn test_event_timestamps() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(AccessLogContract, ());
    let client = AccessLogContractClient::new(&env, &contract_id);

    let patient = Address::generate(&env);
    let doctor = Address::generate(&env);

    client.log_access(&patient, &doctor, &String::from_str(&env, "grant"));

    let events = client.get_access_log(&patient);
    let event = events.get(0).unwrap();
    // Timestamp should be set (ledger timestamp in test is 0 by default)
    assert_eq!(event.timestamp, 0);
    assert_eq!(event.patient, patient);
    assert_eq!(event.accessor, doctor);
}
