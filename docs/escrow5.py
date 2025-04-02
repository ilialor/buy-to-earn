# --- Start of Copied Code (Classes are identical to previous version) ---
import uuid
from decimal import Decimal, getcontext

# Set precision for Decimal calculations
getcontext().prec = 10

# --- Constants ---
PLATFORM_SIGNATURE_ID = "PLATFORM"
MIN_SIGNATURES_REQUIRED = 2
REP_VOTE_THRESHOLD_PERCENT = Decimal("75.0")

# --- Enums (using strings for simplicity) ---
class UserType:
    CUSTOMER = "CUSTOMER"
    CONTRACTOR = "CONTRACTOR"

class OrderStatus:
    PENDING = "PENDING" # Waiting for funding
    FUNDED = "FUNDED"   # Enough funds in escrow, work can start
    IN_PROGRESS = "IN_PROGRESS" # At least one milestone marked complete
    COMPLETED = "COMPLETED" # All milestones paid
    CANCELLED = "CANCELLED" # (Optional future state)

class MilestoneStatus:
    PENDING = "PENDING" # Not started or not marked complete
    COMPLETED_BY_CONTRACTOR = "COMPLETED_BY_CONTRACTOR" # Contractor marked done, waiting for signatures
    PAID = "PAID" # Signatures received, funds released

# --- Helper Functions ---
def generate_id(prefix=""):
    return f"{prefix}{uuid.uuid4().hex[:8]}"

# --- Core Classes ---

class User:
    """Base class for users."""
    def __init__(self, name, user_type):
        self.user_id = generate_id(f"{user_type.lower()}_")
        self.name = name
        self.user_type = user_type
        self.balance = Decimal("0.00")
        print(f"{user_type.capitalize()} '{name}' created with ID: {self.user_id}")

    def _change_balance(self, amount):
        """Protected method to change balance."""
        if self.balance + amount < 0:
            print(f"Error: Insufficient balance for {self.name} ({self.user_id}).")
            return False
        self.balance += amount
        print(f"Balance updated for {self.name} ({self.user_id}): {self.balance:.2f}")
        return True

    def view_balance(self):
        print(f"--- Balance for {self.name} ({self.user_id}) ---")
        print(f"Current Balance: {self.balance:.2f}")
        print("-" * 30)

    def __repr__(self):
        return f"{self.user_type.capitalize()}({self.user_id}, {self.name}, Balance: {self.balance:.2f})"

class Customer(User):
    """Represents a customer user."""
    def __init__(self, name):
        super().__init__(name, UserType.CUSTOMER)
        self.orders_created = {} # order_id: Order
        self.orders_joined = {}  # order_id: contributed_amount

    def deposit(self, amount):
        amount_decimal = Decimal(str(amount))
        if amount_decimal <= 0:
            print("Error: Deposit amount must be positive.")
            return False
        print(f"Attempting deposit of {amount_decimal:.2f} for {self.name}...")
        return self._change_balance(amount_decimal)

class Contractor(User):
    """Represents a contractor user."""
    def __init__(self, name):
        super().__init__(name, UserType.CONTRACTOR)
        self.assigned_orders = set() # set of order_ids

class Milestone:
    """Represents a single milestone within an order."""
    def __init__(self, description, amount):
        if Decimal(str(amount)) <= 0:
             raise ValueError("Milestone amount must be positive.")
        self.milestone_id = generate_id("ms_")
        self.description = description
        self.amount = Decimal(str(amount))
        self.status = MilestoneStatus.PENDING
        self.act = None

    def __repr__(self):
        return (f"Milestone({self.milestone_id}, '{self.description}', "
                f"Amount: {self.amount:.2f}, Status: {self.status})")

class Act:
    """Represents the completion act for a milestone, requiring signatures."""
    def __init__(self, milestone_id, order_id):
        self.act_id = generate_id("act_")
        self.milestone_id = milestone_id
        self.order_id = order_id
        self.signatures = set()
        self.is_complete = False
        print(f"Act {self.act_id} created for Milestone {milestone_id} in Order {order_id}.")

    def add_signature(self, signer_id):
        if self.is_complete:
            print(f"Act {self.act_id} is already complete. No more signatures needed.")
            return False

        if signer_id in self.signatures:
            print(f"Warning: {signer_id} has already signed Act {self.act_id}.")
            return False

        self.signatures.add(signer_id)
        print(f"Signature from '{signer_id}' added to Act {self.act_id}.")
        self.check_completion()
        return True

    def check_completion(self):
        if len(self.signatures) >= MIN_SIGNATURES_REQUIRED:
            self.is_complete = True
            print(f"Act {self.act_id} is now complete with {len(self.signatures)} signatures.")
        return self.is_complete

    def __repr__(self):
        return (f"Act({self.act_id}, Milestone: {self.milestone_id}, "
                f"Signatures: {self.signatures}, Complete: {self.is_complete})")

class Order:
    """Represents a group order with an escrow account."""
    def __init__(self, creator_id, contractor_id, milestones_data):
        self.order_id = generate_id("ord_")
        self.creator_id = creator_id
        self.contractor_id = contractor_id
        self.representative_id = creator_id
        self.milestones = {}
        self.total_cost = Decimal("0.00")
        self.escrow_balance = Decimal("0.00")
        self.status = OrderStatus.PENDING
        self.contributions = {}
        self.votes_for_rep = {}

        print(f"Creating Order {self.order_id} by Customer {creator_id} for Contractor {contractor_id}.")

        if not milestones_data:
             raise ValueError("Order must have at least one milestone.")

        for desc, amount in milestones_data:
            try:
                milestone = Milestone(desc, amount)
                self.milestones[milestone.milestone_id] = milestone
                self.total_cost += milestone.amount
                print(f"  Added Milestone: {milestone.description} ({milestone.amount:.2f}) ID: {milestone.milestone_id}")
            except ValueError as e:
                print(f"  Error adding milestone '{desc}': {e}")
                raise # Re-raise to stop order creation

        print(f"Order {self.order_id} created. Total Cost: {self.total_cost:.2f}, Representative: {self.representative_id}")

    def add_contribution(self, customer_id, amount):
        if self.status != OrderStatus.PENDING:
            print(f"Error: Order {self.order_id} is not pending contributions (Status: {self.status}).")
            return False
        if amount <= 0:
            print("Error: Contribution amount must be positive.")
            return False

        amount_decimal = Decimal(str(amount))
        self.escrow_balance += amount_decimal
        self.contributions[customer_id] = self.contributions.get(customer_id, Decimal("0.00")) + amount_decimal
        print(f"Contribution of {amount_decimal:.2f} from Customer {customer_id} added to Order {self.order_id}.")
        print(f"  Order {self.order_id} Escrow: {self.escrow_balance:.2f} / {self.total_cost:.2f}")
        self.check_funding_status()
        return True

    def check_funding_status(self):
        if self.status == OrderStatus.PENDING and self.escrow_balance >= self.total_cost:
            self.status = OrderStatus.FUNDED
            print(f"Order {self.order_id} is now fully FUNDED!")
        return self.status

    def get_milestone(self, milestone_id):
        return self.milestones.get(milestone_id)

    def mark_milestone_complete_by_contractor(self, milestone_id):
        if self.status not in [OrderStatus.FUNDED, OrderStatus.IN_PROGRESS]:
             print(f"Error: Order {self.order_id} must be FUNDED or IN_PROGRESS to mark milestones (Current: {self.status}).")
             return None

        milestone = self.get_milestone(milestone_id)
        if not milestone:
            print(f"Error: Milestone {milestone_id} not found in Order {self.order_id}.")
            return None
        if milestone.status != MilestoneStatus.PENDING:
            print(f"Error: Milestone {milestone_id} is not in PENDING status (Current: {milestone.status}).")
            return None

        milestone.status = MilestoneStatus.COMPLETED_BY_CONTRACTOR
        milestone.act = Act(milestone_id, self.order_id)
        self.status = OrderStatus.IN_PROGRESS
        print(f"Milestone {milestone_id} ('{milestone.description}') in Order {self.order_id} marked as COMPLETED_BY_CONTRACTOR.")
        return milestone.act

    def release_funds_for_milestone(self, milestone):
        if not milestone or not milestone.act or not milestone.act.is_complete:
             print(f"Error: Cannot release funds. Act for milestone {milestone.milestone_id} not complete or doesn't exist.")
             return False, Decimal("0.00")

        if milestone.status == MilestoneStatus.PAID:
            print(f"Warning: Funds for milestone {milestone.milestone_id} already released.")
            return False, Decimal("0.00")

        # Double check status allows payment release
        if milestone.status != MilestoneStatus.COMPLETED_BY_CONTRACTOR:
             print(f"Error: Milestone {milestone.milestone_id} is not in '{MilestoneStatus.COMPLETED_BY_CONTRACTOR}' status (Current: {milestone.status}). Cannot release funds.")
             return False, Decimal("0.00")


        amount_to_release = milestone.amount
        if self.escrow_balance < amount_to_release:
             print(f"CRITICAL ERROR: Insufficient escrow balance ({self.escrow_balance:.2f}) "
                   f"for milestone {milestone.milestone_id} amount ({amount_to_release:.2f}). Order {self.order_id}")
             return False, Decimal("0.00")

        self.escrow_balance -= amount_to_release
        milestone.status = MilestoneStatus.PAID
        print(f"Funds ({amount_to_release:.2f}) released for Milestone {milestone.milestone_id} ('{milestone.description}') in Order {self.order_id}.")
        print(f"  Order {self.order_id} New Escrow Balance: {self.escrow_balance:.2f}")

        self._check_order_completion()
        return True, amount_to_release

    def _check_order_completion(self):
        all_paid = all(ms.status == MilestoneStatus.PAID for ms in self.milestones.values())
        if all_paid and self.status != OrderStatus.COMPLETED:
            self.status = OrderStatus.COMPLETED
            print(f"Order {self.order_id} is now fully COMPLETED.")

    def add_vote(self, voter_id, candidate_id):
        if voter_id not in self.contributions:
            print(f"Error: Voter {voter_id} has not contributed to Order {self.order_id}.")
            return False
        if candidate_id not in self.contributions:
            # Check if candidate exists as a user, even if they haven't contributed (original requirement is they must have contributed)
            # Sticking to original requirement: candidate must be a contributor
            print(f"Error: Candidate {candidate_id} has not contributed to Order {self.order_id}.")
            return False
        # Allow self-votes
        # if voter_id == candidate_id:
        #      print(f"Info: Voter {voter_id} voted for themselves.")

        self.votes_for_rep[voter_id] = candidate_id
        print(f"Vote recorded: {voter_id} votes for {candidate_id} in Order {self.order_id}.")
        # Check votes immediately after each vote
        self.check_votes()
        return True

    def check_votes(self):
        print(f"Checking votes for representative change in Order {self.order_id}...")
        candidate_support = {} # candidate_id -> total contribution amount of supporters
        total_contributed_by_voters = Decimal("0.00")

        for voter_id, candidate_id in self.votes_for_rep.items():
            voter_contribution = self.contributions.get(voter_id, Decimal("0.00"))
            candidate_support[candidate_id] = candidate_support.get(candidate_id, Decimal("0.00")) + voter_contribution
            total_contributed_by_voters += voter_contribution # Keep track of total voting power

        # Requirement: "75% of the total amount in the order" - interpreting this as 75% of the order's *total cost*
        threshold_amount = (self.total_cost * REP_VOTE_THRESHOLD_PERCENT) / Decimal("100.0")

        print(f"  Vote support totals: { {c: s.to_eng_string() for c, s in candidate_support.items()} }")
        print(f"  Total Order Cost (Base for %): {self.total_cost:.2f}")
        print(f"  Required support amount (>= {REP_VOTE_THRESHOLD_PERCENT}%): {threshold_amount:.2f}")

        successful_candidate = None
        max_support = Decimal("-1.0") # Track max support in case of ties (though first past post wins here)

        for candidate_id, support_amount in candidate_support.items():
            if support_amount >= threshold_amount:
                 # Check if this candidate has more support than previous winners in this check cycle (unlikely needed but safe)
                if support_amount > max_support:
                    successful_candidate = candidate_id
                    max_support = support_amount
                    print(f"  Candidate {candidate_id} reached threshold with {support_amount:.2f} support!")
                    # Break or continue? Let's take the first one to reach threshold.
                    break

        if successful_candidate:
            if successful_candidate != self.representative_id:
                old_rep = self.representative_id
                self.representative_id = successful_candidate
                self.votes_for_rep.clear() # Reset votes after successful change
                print(f"Representative CHANGE successful for Order {self.order_id}!")
                print(f"  Old Representative: {old_rep}")
                print(f"  New Representative: {self.representative_id}")
                print("  Votes have been reset.")
            else:
                 print(f"  Vote confirms current representative {self.representative_id}. No change needed.")
                 # Decide whether to clear votes even if the rep is confirmed
                 self.votes_for_rep.clear()
                 print("  Votes have been reset.")
        else:
            print("  No candidate reached the 75% threshold yet.")


    def view_status(self):
        print(f"\n--- Status for Order {self.order_id} ---")
        print(f"Status: {self.status}")
        print(f"Creator: {self.creator_id}")
        print(f"Contractor: {self.contractor_id}")
        print(f"Representative: {self.representative_id}")
        print(f"Total Cost: {self.total_cost:.2f}")
        print(f"Escrow Balance: {self.escrow_balance:.2f}")
        funding_pct = (self.escrow_balance / self.total_cost * 100) if self.total_cost > 0 else Decimal("0.0")
        print(f"Funding Progress: {funding_pct:.1f}% funded")
        print("Contributions:")
        if self.contributions:
            for cid, amount in self.contributions.items():
                print(f"  - {cid}: {amount:.2f}")
        else:
            print("  (No contributions yet)")
        print("Current Votes for Representative:")
        if self.votes_for_rep:
            for voter, candidate in self.votes_for_rep.items():
                print(f"  - {voter} voted for {candidate}")
        else:
             print("  (No active votes)")
        print("-" * (len(f"--- Status for Order {self.order_id} ---")))


    def view_milestones(self):
        print(f"--- Milestones for Order {self.order_id} ---")
        if not self.milestones:
            print(" (No milestones defined)")
        for ms_id, ms in self.milestones.items():
            print(f"  - ID: {ms_id}")
            print(f"    Desc: {ms.description}")
            print(f"    Amount: {ms.amount:.2f}")
            print(f"    Status: {ms.status}")
            if ms.act:
                print(f"    Act ID: {ms.act.act_id}")
                print(f"    Act Signatures: {ms.act.signatures or '(None)'}")
                print(f"    Act Complete: {ms.act.is_complete}")
        print("-" * (len(f"--- Milestones for Order {self.order_id} ---")))

    def __repr__(self):
        return f"Order({self.order_id}, Status: {self.status}, Cost: {self.total_cost:.2f}, Escrow: {self.escrow_balance:.2f})"


# --- Application Class (Orchestrator) ---

class EscrowApplication:
    def __init__(self):
        self.users = {} # user_id: User object
        self.orders = {} # order_id: Order object
        print("Escrow Application Initialized.")

    def _get_user(self, user_id):
        user = self.users.get(user_id)
        if not user:
            print(f"Error: User with ID {user_id} not found.")
        return user

    def _get_order(self, order_id):
        order = self.orders.get(order_id)
        if not order:
            print(f"Error: Order with ID {order_id} not found.")
        return order

    def create_customer(self, name):
        customer = Customer(name)
        self.users[customer.user_id] = customer
        return customer

    def create_contractor(self, name):
        contractor = Contractor(name)
        self.users[contractor.user_id] = contractor
        return contractor

    def customer_deposit(self, customer_id, amount):
        customer = self._get_user(customer_id)
        if not customer or not isinstance(customer, Customer):
            print(f"Error: Customer {customer_id} not found or invalid type.")
            return False
        return customer.deposit(amount)

    def create_order(self, customer_id, contractor_id, milestones_data):
        """milestones_data: list of tuples, e.g., [('Design Mockup', 100), ('Develop Feature', 500)]"""
        customer = self._get_user(customer_id)
        contractor = self._get_user(contractor_id)

        if not customer or not isinstance(customer, Customer):
            print(f"Error: Creator Customer {customer_id} not found or invalid type.")
            return None
        if not contractor or not isinstance(contractor, Contractor):
            print(f"Error: Contractor {contractor_id} not found or invalid type.")
            return None
        # Check for milestones_data being None or empty list
        if not milestones_data:
            print("Error: Cannot create order with no milestones.")
            return None

        try:
            order = Order(customer_id, contractor_id, milestones_data)
            self.orders[order.order_id] = order
            customer.orders_created[order.order_id] = order
            contractor.assigned_orders.add(order.order_id)
            print(f"Order {order.order_id} successfully registered in the application.")
            return order
        except ValueError as e:
             print(f"Failed to create order: {e}")
             return None
        except Exception as e:
            print(f"An unexpected error occurred during order creation: {e}")
            # In a real app, log this exception trace
            return None


    def join_order(self, customer_id, order_id, amount):
        customer = self._get_user(customer_id)
        order = self._get_order(order_id)

        if not customer or not isinstance(customer, Customer):
            # Error already printed by _get_user
            return False
        if not order:
            # Error already printed by _get_order
            return False

        amount_decimal = Decimal(str(amount))
        if amount_decimal <= 0:
             print("Error: Contribution amount must be positive.")
             return False

        if customer.balance < amount_decimal:
            print(f"Error: Customer {customer.name} ({customer_id}) has insufficient balance ({customer.balance:.2f}) to contribute {amount_decimal:.2f}.")
            return False

        # Check if order is in pending state BEFORE changing balance
        if order.status != OrderStatus.PENDING:
            print(f"Error: Order {order_id} is not in PENDING status (Current: {order.status}). Cannot add contribution.")
            return False

        # Perform transaction: decrease customer balance, increase escrow
        # Use a temporary variable for clarity in case of rollback
        customer_balance_changed = customer._change_balance(-amount_decimal)

        if customer_balance_changed:
            contribution_added = order.add_contribution(customer_id, amount_decimal)
            if contribution_added:
                # Track joined orders for the customer
                customer.orders_joined[order_id] = customer.orders_joined.get(order_id, Decimal("0.00")) + amount_decimal
                print(f"Customer {customer.name} ({customer_id}) successfully joined Order {order_id}.")
                return True
            else:
                # Rollback customer balance if contribution failed (e.g., race condition hit status change)
                print(f"Error: Failed to add contribution to order {order_id} after balance change. Rolling back balance for {customer_id}.")
                customer._change_balance(amount_decimal) # Add back the amount
                return False
        else:
             # Balance change failed (should have been caught by earlier check, but good failsafe)
             print(f"Error: Could not decrease balance for Customer {customer_id}.")
             return False


    def mark_milestone_complete(self, contractor_id, order_id, milestone_id):
        contractor = self._get_user(contractor_id)
        order = self._get_order(order_id)

        if not contractor or not isinstance(contractor, Contractor):
             # Error printed by _get_user
             return None
        if not order:
             # Error printed by _get_order
             return None
        if order.contractor_id != contractor_id:
             print(f"Error: Contractor {contractor.name} ({contractor_id}) is not assigned to Order {order_id}.")
             return None

        # Delegate to order object, which handles status checks
        return order.mark_milestone_complete_by_contractor(milestone_id)


    def sign_act(self, signer_id, order_id, milestone_id):
        """Signer ID can be a user_id or PLATFORM_SIGNATURE_ID."""
        order = self._get_order(order_id)
        if not order:
            return False # Error printed by _get_order

        milestone = order.get_milestone(milestone_id)
        if not milestone:
            print(f"Error: Milestone {milestone_id} not found in Order {order_id}.")
            return False
        if not milestone.act:
             print(f"Error: Act for Milestone {milestone_id} does not exist yet. Contractor must mark complete first.")
             return False

        # Validate signer role more explicitly here
        is_platform = signer_id == PLATFORM_SIGNATURE_ID
        is_contractor = signer_id == order.contractor_id
        is_representative = signer_id == order.representative_id

        signer_desc = "Unknown"
        if is_platform:
            signer_desc = "Platform"
        elif is_contractor:
            # Ensure we use the contractor's actual user object name if available
            contr_user = self._get_user(order.contractor_id)
            signer_desc = f"Contractor ({contr_user.name if contr_user else order.contractor_id})"
        elif is_representative:
             # Ensure we use the representative's actual user object name if available
            rep_user = self._get_user(order.representative_id)
            signer_desc = f"Representative ({rep_user.name if rep_user else order.representative_id})"
        else:
            # Check if it's a customer who contributed but is not the rep
            user = self._get_user(signer_id)
            if user and isinstance(user, Customer) and signer_id in order.contributions:
                 signer_desc = f"Customer ({user.name}, not representative)"
            elif user:
                 signer_desc = f"User ({user.name}, wrong type or not involved)"
            else:
                 signer_desc = f"Invalid Signer ID ({signer_id})"


        if not (is_platform or is_contractor or is_representative):
             print(f"Error: Signer '{signer_id}' ({signer_desc}) is not authorized to sign Act {milestone.act.act_id} for Order {order_id}. "
                   f"Requires: Platform, Contractor {order.contractor_id}, or Representative {order.representative_id}.")
             return False

        print(f"Attempting signature by '{signer_desc}' for Act {milestone.act.act_id} (Milestone {milestone_id})...")

        # Check milestone status *before* signing
        if milestone.status != MilestoneStatus.COMPLETED_BY_CONTRACTOR:
             # Allow signing if already paid (harmless warning), but not if still pending
             if milestone.status == MilestoneStatus.PAID:
                 print(f"Warning: Attempting to sign act for milestone {milestone_id} which is already PAID.")
             elif milestone.status == MilestoneStatus.PENDING:
                  print(f"Error: Cannot sign Act for milestone {milestone_id} because it is still in PENDING status.")
                  return False
             # else (e.g., CANCELLED in future): might need other checks

        if milestone.act.add_signature(signer_id):
            # Act signature added. Check if it became complete and release funds.
            # Check milestone status again *inside* this block to prevent race conditions if status changed.
            if milestone.act.is_complete and milestone.status == MilestoneStatus.COMPLETED_BY_CONTRACTOR:
                print(f"Act {milestone.act.act_id} is now complete. Releasing funds...")
                # Use a separate step for clarity
                self._process_payment_for_milestone(order, milestone)

            return True
        else:
            # Signature was not added (e.g., already signed, act already complete)
            return False

    def _process_payment_for_milestone(self, order, milestone):
        """Internal helper to process payment after act completion."""
        success, amount_released = order.release_funds_for_milestone(milestone)
        if success:
            contractor = self._get_user(order.contractor_id)
            if contractor:
                # This check should ideally never fail if contractor existed to create order
                contractor._change_balance(amount_released)
                print(f"Contractor {contractor.user_id}'s balance updated by +{amount_released:.2f}.")
            else:
                # Log critical error - funds released from escrow but couldn't find contractor
                print(f"CRITICAL ERROR: Contractor {order.contractor_id} not found during fund release for Order {order.order_id}, Milestone {milestone.milestone_id}! Escrow reduced but contractor not paid.")
        else:
            # Fund release failed (e.g., insufficient escrow - should not happen if logic is sound)
            print(f"Error during automated fund release for Act {milestone.act.act_id} of Order {order.order_id}.")


    def vote_for_representative(self, voter_customer_id, order_id, candidate_customer_id):
        voter = self._get_user(voter_customer_id)
        candidate = self._get_user(candidate_customer_id) # Check candidate exists
        order = self._get_order(order_id)

        if not voter or not isinstance(voter, Customer):
            # Error printed by _get_user or type check
            return False
        if not candidate or not isinstance(candidate, Customer):
             # Candidate must be a customer
             print(f"Error: Candidate {candidate_customer_id} not found or is not a Customer.")
             return False
        if not order:
            # Error printed by _get_order
            return False

        # Delegate to order, which checks contributions and performs vote logic
        return order.add_vote(voter_customer_id, candidate_customer_id)

    # --- View methods remain the same ---
    def view_user_balance(self, user_id):
        user = self._get_user(user_id)
        if user:
            user.view_balance()

    def view_order_details(self, order_id):
         order = self._get_order(order_id)
         if order:
             order.view_status()
             order.view_milestones()

    def view_user_orders(self, user_id):
        user = self._get_user(user_id)
        if not user:
            return

        print(f"\n--- Orders associated with {user.name} ({user_id}) ---")
        if isinstance(user, Customer):
            print("Orders Created:")
            if user.orders_created:
                for oid in user.orders_created: print(f"  - {oid}")
            else: print("  (None)")
            print("Orders Joined (Contributions):")
            if user.orders_joined:
                for oid, amount in user.orders_joined.items(): print(f"  - {oid} (Contributed: {amount:.2f})")
            else: print("  (None)")
        elif isinstance(user, Contractor):
             print("Orders Assigned:")
             if user.assigned_orders:
                 for oid in user.assigned_orders: print(f"  - {oid}")
             else: print("  (None)")
        print("-" * 30)

# --- End of Copied Code ---


# --- Revised Example Usage ---
if __name__ == "__main__":
    app = EscrowApplication()

    print("\n--- Step 1: Create Users ---")
    alice = app.create_customer("Alice")
    bob = app.create_customer("Bob")
    charlie = app.create_customer("Charlie")
    contractor_dave = app.create_contractor("Dave")
    contractor_eve = app.create_contractor("Eve") # Another contractor

    print("\n--- Step 2: Customers Deposit Funds ---")
    # Give them enough for the main scenario + extras
    app.customer_deposit(alice.user_id, 1000)
    app.customer_deposit(bob.user_id, 600)
    app.customer_deposit(charlie.user_id, 400) # Enough now

    print("\n--- Step 3: Create Order 1 (Alice for Dave) ---")
    milestones1 = [
        ("P1: Design", 200),
        ("P2: Backend", 800),
        ("P3: Frontend", 500) # Increased cost
    ]
    order1 = app.create_order(alice.user_id, contractor_dave.user_id, milestones1)

    # --- Test Case: Create Order with Invalid Milestone ---
    print("\n--- Test Case: Create Order with Zero Amount Milestone ---")
    invalid_milestones = [("Valid", 100), ("Invalid", 0)]
    app.create_order(alice.user_id, contractor_dave.user_id, invalid_milestones)

    # --- Test Case: Create Order with No Milestones ---
    print("\n--- Test Case: Create Order with No Milestones ---")
    app.create_order(bob.user_id, contractor_eve.user_id, [])


    if not order1:
        print("\nFATAL: Order 1 creation failed, cannot proceed with main scenario.")
        # Exit or skip remaining tests for order1
    else:
        order1_id = order1.order_id
        app.view_order_details(order1_id) # View initial state

        print(f"\n--- Step 4: Funding Order {order1_id} ---")

        # --- Test Case: Insufficient Funds to Join ---
        print("\n--- Test Case: Charlie tries to join with too much ---")
        app.join_order(charlie.user_id, order1_id, 500) # Charlie only has 400
        charlie.view_balance()

        print("\n--- Funding Order 1 - Attempt 1 ---")
        print(f"Order 1 Total Cost: {order1.total_cost:.2f}")
        join_success = app.join_order(alice.user_id, order1_id, 500) # Alice contributes
        if join_success: alice.view_balance()

        join_success = app.join_order(bob.user_id, order1_id, 600) # Bob contributes all his balance
        if join_success: bob.view_balance()

        # Check status before Charlie joins
        app.view_order_details(order1_id) # Show partial funding

        print("\n--- Funding Order 1 - Attempt 2 (Charlie completes funding) ---")
        needed = order1.total_cost - order1.escrow_balance
        print(f"Funding needed for Order {order1_id}: {needed:.2f}")
        if charlie.balance >= needed:
            join_success = app.join_order(charlie.user_id, order1_id, needed) # Charlie contributes the rest
            if join_success: charlie.view_balance()
        else:
            print(f"Charlie cannot contribute the remaining {needed:.2f}, only has {charlie.balance:.2f}")

        # Verify funded status
        app.view_order_details(order1_id) # Show fully funded
        if order1.status != OrderStatus.FUNDED:
             print(f"\nWARNING: Order {order1_id} did not reach FUNDED state. Skipping milestone work.")
        else:
            print(f"\n--- Step 5: Milestone Work for Order {order1_id} ---")

            # Get milestone IDs dynamically
            milestone_ids = list(order1.milestones.keys())
            ms1_id, ms2_id, ms3_id = milestone_ids[0], milestone_ids[1], milestone_ids[2]

            print(f"\n--- Completing Milestone 1 ({ms1_id}) ---")
            act1 = app.mark_milestone_complete(contractor_dave.user_id, order1_id, ms1_id)
            # View details to see milestone marked and act created
            app.view_order_details(order1_id)

            if act1:
                print(f"\n--- Signing Act 1 ({act1.act_id}) ---")
                # --- Test Case: Incorrect Signer ---
                print("\n--- Test Case: Bob (contributor, not rep) tries to sign ---")
                app.sign_act(bob.user_id, order1_id, ms1_id)

                print("\n--- Signing Act 1 - Legitimate Signatures ---")
                sign_ok_platform = app.sign_act(PLATFORM_SIGNATURE_ID, order1_id, ms1_id)
                # Balance check before second signature
                if sign_ok_platform: contractor_dave.view_balance()

                # View details after first signature
                app.view_order_details(order1_id)

                sign_ok_alice = app.sign_act(alice.user_id, order1_id, ms1_id) # Alice is the representative
                # Balance check after second signature (should increase)
                if sign_ok_alice:
                     app.view_order_details(order1_id) # View details to see milestone PAID
                     contractor_dave.view_balance()

                # --- Test Case: Sign again after completion ---
                print("\n--- Test Case: Platform signs again (should be ignored) ---")
                app.sign_act(PLATFORM_SIGNATURE_ID, order1_id, ms1_id)
            else:
                 print(f"Skipping signing for Milestone 1 as act creation failed.")


            print(f"\n--- Step 6: Voting for Representative Change (Order {order1_id}) ---")
            # Contributions: Alice: 500, Bob: 600, Charlie: 400 => Total: 1500
            # Total Cost = 1500. Threshold = 75% of 1500 = 1125.
            # Current Rep: Alice (ID will vary)

            print("--- Vote Attempt 1: Bob votes for himself (Needs 1125) ---")
            app.vote_for_representative(bob.user_id, order1_id, bob.user_id) # Bob (600) -> Not enough
            app.view_order_details(order1_id)

            print("\n--- Vote Attempt 2: Charlie votes for Bob ---")
            app.vote_for_representative(charlie.user_id, order1_id, bob.user_id) # Bob (600) + Charlie (400) = 1000 -> Still not enough
            app.view_order_details(order1_id)

            print("\n--- Vote Attempt 3: Alice votes for Bob ---")
            app.vote_for_representative(alice.user_id, order1_id, bob.user_id) # Bob (600) + Charlie (400) + Alice (500) = 1500 -> Success!
            app.view_order_details(order1_id) # Should show Bob as new rep, votes cleared

            new_representative_id = order1.representative_id # Store the new rep ID

            print(f"\n--- Step 7: Completing Remaining Milestones (Order {order1_id}) ---")

            print(f"\n--- Completing Milestone 2 ({ms2_id}) ---")
            act2 = app.mark_milestone_complete(contractor_dave.user_id, order1_id, ms2_id)
            if act2:
                print(f"\n--- Signing Act 2 ({act2.act_id}) ---")
                app.sign_act(contractor_dave.user_id, order1_id, ms2_id) # Contractor
                app.sign_act(new_representative_id, order1_id, ms2_id) # Use the *new* representative ID (Bob)
                app.view_order_details(order1_id) # Show milestone 2 PAID
                contractor_dave.view_balance()
            else:
                print(f"Skipping signing for Milestone 2 as act creation failed.")


            print(f"\n--- Completing Milestone 3 ({ms3_id}) ---")
            act3 = app.mark_milestone_complete(contractor_dave.user_id, order1_id, ms3_id)
            if act3:
                print(f"\n--- Signing Act 3 ({act3.act_id}) ---")
                app.sign_act(PLATFORM_SIGNATURE_ID, order1_id, ms3_id)
                app.sign_act(contractor_dave.user_id, order1_id, ms3_id)
                # Order should become COMPLETED now
                app.view_order_details(order1_id) # Show milestone 3 PAID and Order COMPLETED
                contractor_dave.view_balance()
            else:
                print(f"Skipping signing for Milestone 3 as act creation failed.")


    print("\n--- Step 8: Create and Fund a Second Order (Bob for Eve) ---")
    milestones2 = [("Analysis", 50), ("Report", 75)]
    order2 = app.create_order(bob.user_id, contractor_eve.user_id, milestones2)

    if order2:
        order2_id = order2.order_id
        # Bob's balance is 0, Alice has 500, Charlie has 0
        app.customer_deposit(bob.user_id, 200) # Give Bob more money

        print(f"\n--- Funding Order {order2_id} ---")
        app.join_order(bob.user_id, order2_id, 50)
        app.join_order(alice.user_id, order2_id, 75) # Alice contributes needed amount

        app.view_order_details(order2_id) # Show order 2 funded

        if order2.status == OrderStatus.FUNDED:
             print(f"\n--- Work on Order {order2_id} ---")
             ms2_1_id = list(order2.milestones.keys())[0]
             act2_1 = app.mark_milestone_complete(contractor_eve.user_id, order2_id, ms2_1_id)
             if act2_1:
                 print(f"\n--- Signing Act for Order 2 ({act2_1.act_id}) ---")
                 app.sign_act(PLATFORM_SIGNATURE_ID, order2_id, ms2_1_id)
                 app.sign_act(contractor_eve.user_id, order2_id, ms2_1_id) # Eve signs her own order's act
                 contractor_eve.view_balance()
             app.view_order_details(order2_id) # Show milestone 1 paid
        else:
            print(f"Order {order2_id} not funded, skipping work.")


    print("\n--- Step 9: Final User Views ---")
    app.view_user_balance(alice.user_id)
    app.view_user_balance(bob.user_id)
    app.view_user_balance(charlie.user_id)
    app.view_user_balance(contractor_dave.user_id)
    app.view_user_balance(contractor_eve.user_id)

    app.view_user_orders(alice.user_id)
    app.view_user_orders(bob.user_id)
    app.view_user_orders(contractor_dave.user_id)
    app.view_user_orders(contractor_eve.user_id)

