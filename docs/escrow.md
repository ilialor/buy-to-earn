Explanation:
Constants & Enums: Define constants like PLATFORM_SIGNATURE_ID and string-based enums for statuses and user types for clarity. Decimal is used for monetary values to avoid floating-point issues.
User Classes (User, Customer, Contractor):
Base User class holds common attributes (user_id, name, balance, user_type) and a protected _change_balance method.
Customer inherits from User and adds a deposit method. It also keeps track of orders created and joined (though the main logic happens in EscrowApplication).
Contractor inherits from User and keeps track of assigned orders.
Milestone Class: Represents a task with a description, amount, status, and a reference to its Act once created.
Act Class: Represents the completion agreement for a milestone. It stores signatures and checks if the required number (MIN_SIGNATURES_REQUIRED) has been reached.
Order Class:
Holds all information about a group order: creator, contractor, representative, milestones, total cost, escrow balance, status, contributions, and votes.
__init__: Calculates total_cost from milestone data.
add_contribution: Adds funds to escrow_balance, records the contributor, and checks if the order becomes FUNDED.
mark_milestone_complete_by_contractor: Changes milestone status and creates an Act.
release_funds_for_milestone: Decreases escrow, updates milestone status to PAID, and checks if the entire order is COMPLETED. Returns the amount released.
add_vote & check_votes: Manages the voting process for changing the representative based on the 75% contribution threshold (REP_VOTE_THRESHOLD_PERCENT) relative to the total_cost.
view_status, view_milestones: Methods for displaying order information.
EscrowApplication Class:
Acts as the central orchestrator and registry.
Holds dictionaries of users and orders.
Provides methods to create users, handle deposits, create orders, join orders, mark milestones complete, sign acts, and handle voting.
Crucially, the sign_act method:
Validates the signer (Platform, Contractor, or current Representative).
Calls act.add_signature().
If the act becomes complete and the milestone isn't already paid, it triggers order.release_funds_for_milestone() and updates the contractor's balance.
Provides view methods (view_user_balance, view_order_details, view_user_orders).
Example Usage (if __name__ == "__main__":)
Demonstrates the entire workflow: creating users, depositing funds, creating an order, joining/funding the order, marking milestones, signing acts (including platform signing), releasing funds, voting for a new representative, completing the order, and viewing final states.
This implementation covers all the requested features in a structured, class-based manner suitable for a mini-application.