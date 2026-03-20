#![cfg(test)]
use super::*;
use soroban_sdk::testutils::Address as _;
use soroban_sdk::{Env, String};

#[test]
fn test_register_patient() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let patient = Address::generate(&env);
    client.register_patient(&patient, &String::from_str(&env, "John Doe"));
    assert!(client.is_registered(&patient));
    let patient_info = client.get_patient(&patient).unwrap();
    assert_eq!(patient_info.name, String::from_str(&env, "John Doe"));
}

#[test]
#[should_panic(expected = "already registered")]
fn test_cannot_register_twice() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);
    let patient = Address::generate(&env);
    client.register_patient(&patient, &String::from_str(&env, "John Doe"));
    client.register_patient(&patient, &String::from_str(&env, "Jane Doe"));
}

#[test]
fn test_permissionless_add_record() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let patient = Address::generate(&env);

    // Register patient
    client.register_patient(&patient, &String::from_str(&env, "John Doe"));

    // PERMISSIONLESS: Anyone can add record for patient - no auth required
    // In real usage, any address can call add_record for any patient
    let record_id = client.add_record(
        &patient,
        &String::from_str(&env, "diagnosis"),
        &String::from_str(&env, "Patient diagnosed with flu"),
        &String::from_str(&env, "Prescribed rest and fluids"),
        &String::from_str(&env, "Dr. Emergency"),
    );

    assert_eq!(record_id, 1);
    assert_eq!(client.get_record_count(&patient), 1);
}

#[test]
fn test_anyone_can_add_records() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let patient = Address::generate(&env);
    client.register_patient(&patient, &String::from_str(&env, "John Doe"));

    // Multiple different people can add records for the same patient
    client.add_record(
        &patient,
        &String::from_str(&env, "checkup"),
        &String::from_str(&env, "Annual checkup"),
        &String::from_str(&env, "All vitals normal"),
        &String::from_str(&env, "Dr. Smith"),
    );
    client.add_record(
        &patient,
        &String::from_str(&env, "vaccination"),
        &String::from_str(&env, "COVID-19 vaccine dose 1"),
        &String::from_str(&env, "No side effects"),
        &String::from_str(&env, "City Clinic"),
    );
    client.add_record(
        &patient,
        &String::from_str(&env, "lab"),
        &String::from_str(&env, "Blood work complete"),
        &String::from_str(&env, "Results pending"),
        &String::from_str(&env, "Lab Corp"),
    );

    assert_eq!(client.get_record_count(&patient), 3);
}

#[test]
#[should_panic(expected = "patient not registered")]
fn test_add_record_not_registered() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);
    let unregistered = Address::generate(&env);
    client.add_record(
        &unregistered,
        &String::from_str(&env, "checkup"),
        &String::from_str(&env, "Test"),
        &String::from_str(&env, "Notes"),
        &String::from_str(&env, "Dr. Test"),
    );
}

#[test]
fn test_grant_access() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let patient = Address::generate(&env);
    let doctor = Address::generate(&env);
    client.register_patient(&patient, &String::from_str(&env, "John Doe"));
    client.grant_access(&patient, &doctor);
    assert!(client.has_access(&patient, &doctor));
}

#[test]
fn test_revoke_access() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let patient = Address::generate(&env);
    let doctor = Address::generate(&env);
    client.register_patient(&patient, &String::from_str(&env, "John Doe"));
    client.grant_access(&patient, &doctor);
    assert!(client.has_access(&patient, &doctor));
    client.revoke_access(&patient, &doctor);
    assert!(!client.has_access(&patient, &doctor));
}

#[test]
fn test_get_record_as_patient() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let patient = Address::generate(&env);
    client.register_patient(&patient, &String::from_str(&env, "John Doe"));
    client.add_record(
        &patient,
        &String::from_str(&env, "checkup"),
        &String::from_str(&env, "Annual checkup"),
        &String::from_str(&env, "Patient healthy"),
        &String::from_str(&env, "Dr. Smith"),
    );

    let record = client.get_record(&patient, &patient, &1).unwrap();
    assert_eq!(record.id, 1);
    assert_eq!(record.description, String::from_str(&env, "Annual checkup"));
    assert_eq!(record.record_type, String::from_str(&env, "checkup"));
}

#[test]
fn test_get_record_as_accessor() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let patient = Address::generate(&env);
    let doctor = Address::generate(&env);
    client.register_patient(&patient, &String::from_str(&env, "John Doe"));
    client.grant_access(&patient, &doctor);
    client.add_record(
        &patient,
        &String::from_str(&env, "checkup"),
        &String::from_str(&env, "Annual checkup"),
        &String::from_str(&env, "Patient healthy"),
        &String::from_str(&env, "Dr. Smith"),
    );

    let record = client.get_record(&doctor, &patient, &1).unwrap();
    assert_eq!(record.id, 1);
    assert_eq!(record.description, String::from_str(&env, "Annual checkup"));
}

#[test]
#[should_panic(expected = "no access granted")]
fn test_get_record_no_access() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let patient = Address::generate(&env);
    let stranger = Address::generate(&env);
    client.register_patient(&patient, &String::from_str(&env, "John Doe"));
    client.add_record(
        &patient,
        &String::from_str(&env, "checkup"),
        &String::from_str(&env, "Annual checkup"),
        &String::from_str(&env, "Patient healthy"),
        &String::from_str(&env, "Dr. Smith"),
    );

    // Stranger without access cannot view record
    client.get_record(&stranger, &patient, &1);
}

#[test]
fn test_get_records_as_patient() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let patient = Address::generate(&env);
    client.register_patient(&patient, &String::from_str(&env, "John Doe"));
    client.add_record(
        &patient,
        &String::from_str(&env, "checkup"),
        &String::from_str(&env, "Checkup 1"),
        &String::from_str(&env, "Notes 1"),
        &String::from_str(&env, "Dr. Smith"),
    );
    client.add_record(
        &patient,
        &String::from_str(&env, "vaccination"),
        &String::from_str(&env, "Vaccine"),
        &String::from_str(&env, "Notes 2"),
        &String::from_str(&env, "Dr. Johnson"),
    );

    let records = client.get_records(&patient, &patient);
    assert_eq!(records.len(), 2);
}

#[test]
fn test_get_records_as_accessor() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let patient = Address::generate(&env);
    let doctor = Address::generate(&env);
    client.register_patient(&patient, &String::from_str(&env, "John Doe"));
    client.grant_access(&patient, &doctor);
    client.add_record(
        &patient,
        &String::from_str(&env, "checkup"),
        &String::from_str(&env, "Checkup"),
        &String::from_str(&env, "Notes"),
        &String::from_str(&env, "Dr. Smith"),
    );

    let records = client.get_records(&doctor, &patient);
    assert_eq!(records.len(), 1);
}

#[test]
fn test_is_registered() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let patient = Address::generate(&env);
    let unregistered = Address::generate(&env);
    client.register_patient(&patient, &String::from_str(&env, "John Doe"));
    assert!(client.is_registered(&patient));
    assert!(!client.is_registered(&unregistered));
}

#[test]
fn test_multiple_patients_independent() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let patient1 = Address::generate(&env);
    let patient2 = Address::generate(&env);
    client.register_patient(&patient1, &String::from_str(&env, "John Doe"));
    client.register_patient(&patient2, &String::from_str(&env, "Jane Doe"));

    client.add_record(
        &patient1,
        &String::from_str(&env, "checkup"),
        &String::from_str(&env, "John's checkup"),
        &String::from_str(&env, "John's notes"),
        &String::from_str(&env, "Dr. A"),
    );
    client.add_record(
        &patient2,
        &String::from_str(&env, "vaccination"),
        &String::from_str(&env, "Jane's vaccine"),
        &String::from_str(&env, "Jane's notes"),
        &String::from_str(&env, "Dr. B"),
    );
    client.add_record(
        &patient2,
        &String::from_str(&env, "lab"),
        &String::from_str(&env, "Jane's lab"),
        &String::from_str(&env, "Jane's lab notes"),
        &String::from_str(&env, "Dr. C"),
    );

    assert_eq!(client.get_record_count(&patient1), 1);
    assert_eq!(client.get_record_count(&patient2), 2);

    let john_records = client.get_records(&patient1, &patient1);
    let jane_records = client.get_records(&patient2, &patient2);
    assert_eq!(john_records.len(), 1);
    assert_eq!(jane_records.len(), 2);

    let john_record = john_records.get(0).unwrap();
    assert_eq!(
        john_record.description,
        String::from_str(&env, "John's checkup")
    );
}

#[test]
#[should_panic(expected = "not registered as patient")]
fn test_grant_access_not_registered() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);
    let unregistered = Address::generate(&env);
    let accessor = Address::generate(&env);
    client.grant_access(&unregistered, &accessor);
}
