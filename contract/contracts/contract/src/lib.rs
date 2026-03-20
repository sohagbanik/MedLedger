#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, Map, String, Vec};

#[contracttype]
#[derive(Clone)]
pub struct Patient {
    pub name: String,
    pub created_at: u64,
}

#[contracttype]
#[derive(Clone)]
pub struct MedicalRecord {
    pub id: u64,
    pub record_type: String,
    pub description: String,
    pub notes: String,
    pub reporter_name: String,
    pub created_at: u64,
}

#[contracttype]
pub enum DataKey {
    Patients,
    RecordCounter(Address),
    Records(Address, u64),
    Access(Address, Address),
}

#[contract]
pub struct Contract;

#[contractimpl]
impl Contract {
    /// Register caller as a patient. Permissionless - anyone can register.
    pub fn register_patient(env: Env, caller: Address, name: String) {
        caller.require_auth();
        let mut patients: Map<Address, Patient> = env
            .storage()
            .instance()
            .get(&DataKey::Patients)
            .unwrap_or(Map::new(&env));
        assert!(!patients.contains_key(caller.clone()), "already registered");
        patients.set(
            caller.clone(),
            Patient {
                name,
                created_at: env.ledger().timestamp(),
            },
        );
        env.storage().instance().set(&DataKey::Patients, &patients);
    }

    /// PERMISSIONLESS: Add a medical record for any registered patient.
    /// NO auth required - anyone can add records for anyone.
    pub fn add_record(
        env: Env,
        patient: Address,
        record_type: String,
        description: String,
        notes: String,
        reporter_name: String,
    ) -> u64 {
        // Verify patient is registered
        let patients: Map<Address, Patient> = env
            .storage()
            .instance()
            .get(&DataKey::Patients)
            .unwrap_or(Map::new(&env));
        assert!(
            patients.contains_key(patient.clone()),
            "patient not registered"
        );

        // Increment record counter for this patient
        let counter_key = DataKey::RecordCounter(patient.clone());
        let mut counter: u64 = env.storage().instance().get(&counter_key).unwrap_or(0);
        counter += 1;
        env.storage().instance().set(&counter_key, &counter);

        // Store the record
        let record = MedicalRecord {
            id: counter,
            record_type,
            description,
            notes,
            reporter_name,
            created_at: env.ledger().timestamp(),
        };
        let record_key = DataKey::Records(patient.clone(), counter);
        env.storage().persistent().set(&record_key, &record);
        counter
    }

    /// Grant access to another address to view caller's records.
    pub fn grant_access(env: Env, caller: Address, accessor: Address) {
        caller.require_auth();
        let patients: Map<Address, Patient> = env
            .storage()
            .instance()
            .get(&DataKey::Patients)
            .unwrap_or(Map::new(&env));
        assert!(
            patients.contains_key(caller.clone()),
            "not registered as patient"
        );
        let access_key = DataKey::Access(caller.clone(), accessor);
        env.storage().instance().set(&access_key, &true);
    }

    /// Revoke access from another address.
    pub fn revoke_access(env: Env, caller: Address, accessor: Address) {
        caller.require_auth();
        let access_key = DataKey::Access(caller.clone(), accessor);
        env.storage().instance().remove(&access_key);
    }

    /// Get a specific medical record. Caller must be the patient or have been granted access.
    pub fn get_record(
        env: Env,
        caller: Address,
        patient: Address,
        record_id: u64,
    ) -> Option<MedicalRecord> {
        let patients: Map<Address, Patient> = env
            .storage()
            .instance()
            .get(&DataKey::Patients)
            .unwrap_or(Map::new(&env));
        assert!(patients.contains_key(patient.clone()), "patient not found");

        if caller != patient {
            let access_key = DataKey::Access(patient.clone(), caller);
            assert!(
                env.storage()
                    .instance()
                    .get::<_, bool>(&access_key)
                    .unwrap_or(false),
                "no access granted"
            );
        }

        let record_key = DataKey::Records(patient.clone(), record_id);
        env.storage().persistent().get(&record_key)
    }

    /// Get all medical records for a patient.
    pub fn get_records(env: Env, caller: Address, patient: Address) -> Vec<MedicalRecord> {
        let patients: Map<Address, Patient> = env
            .storage()
            .instance()
            .get(&DataKey::Patients)
            .unwrap_or(Map::new(&env));
        assert!(patients.contains_key(patient.clone()), "patient not found");

        if caller != patient {
            let access_key = DataKey::Access(patient.clone(), caller);
            assert!(
                env.storage()
                    .instance()
                    .get::<_, bool>(&access_key)
                    .unwrap_or(false),
                "no access granted"
            );
        }

        let counter_key = DataKey::RecordCounter(patient.clone());
        let total_records: u64 = env.storage().instance().get(&counter_key).unwrap_or(0);
        let mut records = Vec::new(&env);

        let mut i: u64 = 1;
        while i <= total_records {
            let record_key = DataKey::Records(patient.clone(), i);
            if let Some(record) = env
                .storage()
                .persistent()
                .get::<_, MedicalRecord>(&record_key)
            {
                records.push_back(record);
            }
            i += 1;
        }
        records
    }

    /// Check if an address is registered as a patient.
    pub fn is_registered(env: Env, patient: Address) -> bool {
        let patients: Map<Address, Patient> = env
            .storage()
            .instance()
            .get(&DataKey::Patients)
            .unwrap_or(Map::new(&env));
        patients.contains_key(patient)
    }

    /// Get patient info.
    pub fn get_patient(env: Env, patient: Address) -> Option<Patient> {
        let patients: Map<Address, Patient> = env
            .storage()
            .instance()
            .get(&DataKey::Patients)
            .unwrap_or(Map::new(&env));
        patients.get(patient)
    }

    /// Check if an accessor has been granted access to a patient's records.
    pub fn has_access(env: Env, patient: Address, accessor: Address) -> bool {
        let access_key = DataKey::Access(patient, accessor);
        env.storage().instance().get(&access_key).unwrap_or(false)
    }

    /// Get the count of records for a patient.
    pub fn get_record_count(env: Env, patient: Address) -> u64 {
        let counter_key = DataKey::RecordCounter(patient);
        env.storage().instance().get(&counter_key).unwrap_or(0)
    }
}

mod test;
