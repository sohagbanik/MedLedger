#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, Vec, String, Symbol};

/// Represents a single access event log entry.
#[contracttype]
#[derive(Clone)]
pub struct AccessEvent {
    pub patient: Address,
    pub accessor: Address,
    /// "grant" or "revoke"
    pub action: String,
    pub timestamp: u64,
}

/// Storage keys for the AccessLog contract.
#[contracttype]
pub enum LogKey {
    /// Vec<AccessEvent> for a given patient
    Events(Address),
    /// Total event count across all patients
    TotalCount,
}

#[contract]
pub struct AccessLogContract;

#[contractimpl]
impl AccessLogContract {
    /// Log an access event. Called by the main Medical Records contract
    /// via inter-contract invocation when access is granted or revoked.
    ///
    /// This is intentionally permissionless so that any contract can call it.
    /// In production you would add an admin/whitelist check.
    pub fn log_access(
        env: Env,
        patient: Address,
        accessor: Address,
        action: String,
    ) -> u64 {
        let event = AccessEvent {
            patient: patient.clone(),
            accessor: accessor.clone(),
            action: action.clone(),
            timestamp: env.ledger().timestamp(),
        };

        // Append to patient's event list
        let key = LogKey::Events(patient.clone());
        let mut events: Vec<AccessEvent> = env
            .storage()
            .persistent()
            .get(&key)
            .unwrap_or(Vec::new(&env));
        events.push_back(event);
        let count = events.len();
        env.storage().persistent().set(&key, &events);

        // Increment global counter
        let total_key = LogKey::TotalCount;
        let mut total: u64 = env.storage().instance().get(&total_key).unwrap_or(0);
        total += 1;
        env.storage().instance().set(&total_key, &total);

        // Emit a Soroban event for real-time streaming
        env.events().publish(
            (Symbol::new(&env, "access_log"), patient),
            (accessor, action),
        );

        count as u64
    }

    /// Get all access events for a given patient.
    pub fn get_access_log(env: Env, patient: Address) -> Vec<AccessEvent> {
        let key = LogKey::Events(patient);
        env.storage()
            .persistent()
            .get(&key)
            .unwrap_or(Vec::new(&env))
    }

    /// Get the total number of access events logged across all patients.
    pub fn get_total_events(env: Env) -> u64 {
        let total_key = LogKey::TotalCount;
        env.storage().instance().get(&total_key).unwrap_or(0)
    }

    /// Get the number of access events for a specific patient.
    pub fn get_event_count(env: Env, patient: Address) -> u64 {
        let key = LogKey::Events(patient);
        let events: Vec<AccessEvent> = env
            .storage()
            .persistent()
            .get(&key)
            .unwrap_or(Vec::new(&env));
        events.len() as u64
    }
}

mod test;
