#====================================================================================================
# START - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================

# THIS SECTION CONTAINS CRITICAL TESTING INSTRUCTIONS FOR BOTH AGENTS
# BOTH MAIN_AGENT AND TESTING_AGENT MUST PRESERVE THIS ENTIRE BLOCK

# Communication Protocol:
# If the `testing_agent` is available, main agent should delegate all testing tasks to it.
#
# You have access to a file called `test_result.md`. This file contains the complete testing state
# and history, and is the primary means of communication between main and the testing agent.
#
# Main and testing agents must follow this exact format to maintain testing data. 
# The testing data must be entered in yaml format Below is the data structure:
# 
## user_problem_statement: {problem_statement}
## backend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.py"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## frontend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.js"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## metadata:
##   created_by: "main_agent"
##   version: "1.0"
##   test_sequence: 0
##   run_ui: false
##
## test_plan:
##   current_focus:
##     - "Task name 1"
##     - "Task name 2"
##   stuck_tasks:
##     - "Task name with persistent issues"
##   test_all: false
##   test_priority: "high_first"  # or "sequential" or "stuck_first"
##
## agent_communication:
##     -agent: "main"  # or "testing" or "user"
##     -message: "Communication message between agents"

# Protocol Guidelines for Main agent
#
# 1. Update Test Result File Before Testing:
#    - Main agent must always update the `test_result.md` file before calling the testing agent
#    - Add implementation details to the status_history
#    - Set `needs_retesting` to true for tasks that need testing
#    - Update the `test_plan` section to guide testing priorities
#    - Add a message to `agent_communication` explaining what you've done
#
# 2. Incorporate User Feedback:
#    - When a user provides feedback that something is or isn't working, add this information to the relevant task's status_history
#    - Update the working status based on user feedback
#    - If a user reports an issue with a task that was marked as working, increment the stuck_count
#    - Whenever user reports issue in the app, if we have testing agent and task_result.md file so find the appropriate task for that and append in status_history of that task to contain the user concern and problem as well 
#
# 3. Track Stuck Tasks:
#    - Monitor which tasks have high stuck_count values or where you are fixing same issue again and again, analyze that when you read task_result.md
#    - For persistent issues, use websearch tool to find solutions
#    - Pay special attention to tasks in the stuck_tasks list
#    - When you fix an issue with a stuck task, don't reset the stuck_count until the testing agent confirms it's working
#
# 4. Provide Context to Testing Agent:
#    - When calling the testing agent, provide clear instructions about:
#      - Which tasks need testing (reference the test_plan)
#      - Any authentication details or configuration needed
#      - Specific test scenarios to focus on
#      - Any known issues or edge cases to verify
#
# 5. Call the testing agent with specific instructions referring to test_result.md
#
# IMPORTANT: Main agent must ALWAYS update test_result.md BEFORE calling the testing agent, as it relies on this file to understand what to test next.

#====================================================================================================
# END - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================



#====================================================================================================
# Testing Data - Main Agent and testing sub agent both should log testing data below this section
#====================================================================================================

user_problem_statement: |
  VEIL — App de citas premium con identidad esmeralda/dorada, máscaras, sin etiquetas.
  Última iteración: añadir flujo de selección de orientación (chico busca chica, chica busca chico,
  chico busca chico, chica busca chica) y filtrar los descubrimientos por esa preferencia.

backend:
  - task: "Orientation filtering on /api/users/nearby and /api/users/daily-picks"
    implemented: true
    working: true
    file: "backend/server.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: true
        agent: "main"
        comment: "Verified via curl. Review (looking=both)→60 users. Lucia(woman→man)→46 men 0 women. Valeria(woman→woman)→0 men 14 women. Mateo(man→woman)→0 men 15 women. All filters operate correctly."

  - task: "Seed demo women (DEMO_WOMEN) with gender and looking_for"
    implemented: true
    working: true
    file: "backend/server.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: true
        agent: "main"
        comment: "Added DEMO_WOMEN list (15 women), seeded successfully. Backfill operations applied to existing demo users. DB now has 45 men + 15 women, all with gender + looking_for."

frontend:
  - task: "Orientation selection screen between Welcome and Register"
    implemented: true
    working: true
    file: "frontend/app/(auth)/orientation.tsx"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: true
        agent: "main"
        comment: "Screenshot verified. Title '¿Cómo te identificas?' with 4 option cards (chico↔chica, chica↔chico, chico↔chico, chica↔chica). Selection state + gold CTA when chosen. Navigates to register with gender + looking_for params."

  - task: "Welcome screen with centered mask + smoke background"
    implemented: true
    working: true
    file: "frontend/app/(auth)/welcome.tsx"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: true
        agent: "main"
        comment: "Screenshot verified. Centered mask logo with halo, smoke-bg.jpg overlay, V E I L brand at top, 18+ badge, tagline 'Más allá de las apariencias… Una conexión real sin máscaras.', dual CTAs (Crear mi velo / Ya formo parte)."

metadata:
  created_by: "main_agent"
  version: "1.1"
  test_sequence: 1
  run_ui: false

test_plan:
  current_focus: []
  stuck_tasks: []
  test_all: false
  test_priority: "high_first"

agent_communication:
  - agent: "main"
    message: "Orientation flow completed: backend filters /nearby and /daily-picks by current user's looking_for. DEMO_WOMEN seeded. Frontend Welcome + Orientation screens verified via screenshot. End-to-end flow works."
  - agent: "main"
    message: |
      Three premium features added:
        1) Gifts (Élite): POST /api/gifts/send + 5 gift types (golden_mask, crystal_rose, silk_veil free; emerald_heart, diamond Élite). Animated GiftBubble + gift picker modal in chat.
        2) Reveal Filter (Privé): GET/POST /api/reveal/{user_id}. Photo veiled with smoke+mask overlay until each side sends >=3 msgs OR premium user reveals manually.
        3) Profile Preferences: orientation modal in profile tab, 6 options (incl. "busca todo"), saves via PUT /api/profile.
      Welcome screen redesigned with hero artwork (welcome-hero.jpg) + 6 animated drifting smoke layers (real movement).
      app.json updated for App Store Connect: name="Veil - Citas y encuentros", bundle="com.veildating.social", display name="Veil".
      Architecture document created at /app/memory/PLANOS.md.