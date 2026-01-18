#!/bin/bash
set -e

# Colors for better visibility
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

if [ -z "$1" ]; then
  echo -e "${RED}Usage: $0 <iterations>${NC}"
  exit 1
fi

echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}  Ralph - PRD Auto-Implementation Runner${NC}"
echo -e "${CYAN}  Max iterations: $1${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
echo ""

for ((i=1; i<=$1; i++)); do
  echo -e "${BLUE}───────────────────────────────────────────────────────────────${NC}"
  echo -e "${YELLOW}⏳ Iteration $i/$1 starting...${NC}"
  echo -e "${BLUE}───────────────────────────────────────────────────────────────${NC}"
  
  start_time=$(date +%s)
  
  # Use --output-format stream-json for real-time feedback
  # Pipe through a processor to show progress
  result=$(claude --dangerously-skip-permissions \
    --output-format stream-json \
    -p "@PRD.md @progress.txt \
  1. Find the highest-priority task and implement it. \
  2. Run your tests and type checks. \
  3. Update the PRD with what was done. \
  4. Append your progress to progress.txt. \
  ONLY WORK ON A SINGLE TASK. \
  If the PRD is complete, output <promise>COMPLETE</promise>." 2>&1 | \
  while IFS= read -r line; do
    # Parse streaming JSON and show relevant updates
    if echo "$line" | jq -e '.type == "assistant"' > /dev/null 2>&1; then
      # Extract and display assistant text chunks
      text=$(echo "$line" | jq -r '.message.content[]? | select(.type == "text") | .text // empty' 2>/dev/null)
      if [ -n "$text" ]; then
        echo -e "${NC}$text"
      fi
    elif echo "$line" | jq -e '.type == "content_block_delta"' > /dev/null 2>&1; then
      # Show streaming text deltas
      delta=$(echo "$line" | jq -r '.delta.text // empty' 2>/dev/null)
      if [ -n "$delta" ]; then
        printf "%s" "$delta"
      fi
    elif echo "$line" | jq -e '.type == "result"' > /dev/null 2>&1; then
      # Capture final result
      echo "$line" | jq -r '.result // empty' 2>/dev/null
    else
      # For non-JSON or other output, just pass through
      if ! echo "$line" | jq -e '.' > /dev/null 2>&1; then
        echo "$line"
      fi
    fi
  done)
  
  end_time=$(date +%s)
  duration=$((end_time - start_time))
  
  echo ""
  echo -e "${GREEN}✓ Iteration $i completed in ${duration}s${NC}"
  
  # Check for completion
  if [[ "$result" == *"<promise>COMPLETE</promise>"* ]]; then
    echo ""
    echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}  🎉 PRD COMPLETE after $i iteration(s)!${NC}"
    echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
    exit 0
  fi
  
  echo -e "${CYAN}📋 Progress so far: $i/$1 iterations${NC}"
  echo ""
done

echo ""
echo -e "${YELLOW}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}  ⚠️  Max iterations ($1) reached. ${NC}"
echo -e "${YELLOW}═══════════════════════════════════════════════════════════════${NC}"