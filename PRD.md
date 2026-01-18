# PRD - Feature Requirements

```json
{
  "features": [
    {
      "category": "functional",
      "description": "User can select a status from the Status dropdown",
      "steps": [
        "Navigate to the form page",
        "Click the Status dropdown",
        "Verify dropdown options are displayed",
        "Select an option and verify selection is shown"
      ],
      "passes": true
    },
    {
      "category": "ui",
      "description": "Status dropdown displays with correct styling and placeholder",
      "steps": [
        "Navigate to the form page",
        "Verify Status dropdown is visible with label",
        "Verify placeholder text shows 'Select Status'",
        "Verify dropdown matches design system styling"
      ],
      "passes": true
    },
    {
      "category": "ui",
      "description": "Add a new dropdown component below the existing Status dropdown",
      "steps": [
        "Navigate to the page containing the Status dropdown",
        "Verify a new dropdown component is rendered directly below the Status dropdown",
        "Verify the new dropdown has a label and placeholder text",
        "Click the new dropdown and verify options are displayed",
        "Select an option and verify the selection is captured",
        "Verify the new dropdown maintains consistent styling with the Status dropdown"
      ],
      "passes": true
    },
    {
      "category": "ui",
      "description": "Remove Priority dropdown in the form page",
      "steps": [
        "Navigate to the form page",
        "Verify the dropdown component is removed from the page directly under the Type dropdown"
      ],
      "passes": true
    },
    {
      "category": "ui",
      "description": "Add a new Gender dropdown component in the form page",
      "steps": [
        {
          "action": "Navigate to the form page",
          "reference": "",
          "notes": []
        },
        {
          "action": "Verify a new Gender dropdown component is rendered directly below the Type dropdown",
          "reference": "",
          "notes": []
        },
        {
          "action": "Verify the new dropdown has a label and placeholder text",
          "reference": "",
          "notes": []
        },
        {
          "action": "Click the new dropdown and verify options are displayed",
          "reference": "",
          "notes": []
        },
        {
          "action": "Select an option and verify the selection is captured",
          "reference": "",
          "notes": []
        },
        {
          "action": "Verify the new dropdown maintains consistent styling with the Status dropdown",
          "reference": "",
          "notes": []
        }
      ],
      "passes": true
    },
    {
      "category": "ui",
      "description": "Add a new Landing page",
      "steps": [
        {
          "action": "Navigate to the Home page and login with newuser user",
          "reference": "",
          "notes": []
        },
        {
          "action": "Verify after login that you are at Landing page",
          "reference": "",
          "notes": []
        },
        {
          "action": "Verify that you are able to see a single square card component with title Form in it",
          "reference": "",
          "notes": []
        },
        {
          "action": "Click on Form card",
          "reference": "",
          "notes": []
        },
        {
          "action": "Verify you are now in the Form page after the click",
          "reference": "",
          "notes": []
        }
      ],
      "passes": true
    }
  ]
}
```
