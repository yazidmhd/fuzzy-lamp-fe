import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ApiService, DataItem, UserPreference } from '../services/api.service';

interface DropdownOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css']
})
export class FormComponent implements OnInit {

  // User ID from route params
  userId: string = '';

  // Loading state for initial preference check
  initialLoading = true;

  // Dropdown options
  categoryOptions: DropdownOption[] = [];
  subcategoryOptions: DropdownOption[] = [];
  statusOptions: DropdownOption[] = [];
  departmentOptions: DropdownOption[] = [];
  regionOptions: DropdownOption[] = [];
  typeOptions: DropdownOption[] = [];
  genderOptions: DropdownOption[] = [];

  // Selected values
  selectedCategory: string | null = null;
  selectedSubcategory: string | null = null;
  selectedStatus: string | null = null;
  selectedDepartment: string | null = null;
  selectedRegion: string | null = null;
  selectedType: string | null = null;
  selectedGender: string | null = null;

  // Loading states (per dropdown)
  categoryLoading = false;
  subcategoryLoading = false;
  statusLoading = false;
  departmentLoading = false;
  regionLoading = false;
  typeLoading = false;
  genderLoading = false;

  // Track parent value for subcategory caching
  subcategoryParentValue: string | null = null;

  // Table data
  tableData: DataItem[] = [];
  tableLoading = false;
  showTable = false;

  // ===== Radio/Dropdown Example =====
  // Main radio options (Option A / Option B)
  mainOptions: string[] = [];
  selectedMainOption: string | null = null;
  mainOptionsLoading = false;
  mainOptionsLoaded = false;

  // Option A sub-radio options
  optionASubOptions: string[] = [];
  selectedSubOption: string | null = null;
  subOptionsLoading = false;
  subOptionsLoaded = false;

  // Dropdown for Option A (based on sub-option selection)
  optionADropdownOptions: DropdownOption[] = [];
  selectedOptionADropdown: string | null = null;
  optionADropdownLoading = false;
  optionADropdownParent: string | null = null;

  // Dropdown for Option B (direct)
  optionBDropdownOptions: DropdownOption[] = [];
  selectedOptionBDropdown: string | null = null;
  optionBDropdownLoading = false;
  optionBDropdownLoaded = false;

  // Error Modal
  showErrorModal = false;
  errorMessage = '';

  // Form lock state
  formLocked = false;

  constructor(
    private apiService: ApiService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userId = this.route.snapshot.queryParams['userId'] || '';

    if (!this.userId) {
      // No user ID, redirect to home
      this.router.navigate(['/']);
      return;
    }

    // Check for saved preferences
    this.loadUserPreferences();
  }

  // Load user preferences from backend
  loadUserPreferences(): void {
    this.initialLoading = true;

    this.apiService.getUserPreference(this.userId).subscribe({
      next: (pref) => {
        // User has saved preferences - load them
        this.applySavedPreferences(pref);
      },
      error: () => {
        // No saved preferences - just load main options
        this.initialLoading = false;
        this.loadMainOptions();
      }
    });
  }

  // Apply saved preferences to form fields
  applySavedPreferences(pref: UserPreference): void {
    // Set all saved values first
    this.selectedCategory = pref.category || null;
    this.selectedSubcategory = pref.subcategory || null;
    this.selectedStatus = pref.status || null;
    this.selectedMainOption = pref.mainOption || null;
    this.selectedSubOption = pref.subOption || null;
    this.selectedOptionADropdown = pref.optionAValue || null;
    this.selectedOptionBDropdown = pref.optionBValue || null;

    // Load dropdown options for saved values
    this.loadDropdownOptionsForSavedValues(pref);
  }

  // Load all dropdown options needed for saved values
  loadDropdownOptionsForSavedValues(pref: UserPreference): void {
    const requests: any = {};

    // Always load main options
    requests.mainOptions = this.apiService.getMainOptions();

    // Load category options if category is set
    if (pref.category) {
      requests.categories = this.apiService.getCategories();
    }

    // Load subcategory options if subcategory is set
    if (pref.subcategory && pref.category) {
      requests.subcategories = this.apiService.getSubcategories(pref.category);
    }

    // Load status options if status is set
    if (pref.status) {
      requests.statuses = this.apiService.getStatuses();
    }

    // Load Option A sub-options if main option is Option A
    if (pref.mainOption === 'Option A') {
      requests.optionASubOptions = this.apiService.getOptionASubOptions();

      // Load Option A dropdown if sub-option is set
      if (pref.subOption) {
        requests.optionADropdown = this.apiService.getOptionADropdown(pref.subOption);
      }
    }

    // Load Option B dropdown if main option is Option B
    if (pref.mainOption === 'Option B') {
      requests.optionBDropdown = this.apiService.getOptionBDropdown();
    }

    // Execute all requests in parallel
    forkJoin(requests).subscribe({
      next: (results: any) => {
        // Apply loaded options
        if (results.mainOptions) {
          this.mainOptions = results.mainOptions;
          this.mainOptionsLoaded = true;
        }

        if (results.categories) {
          this.categoryOptions = results.categories.map((item: string) => ({ label: item, value: item }));
        }

        if (results.subcategories) {
          this.subcategoryOptions = results.subcategories.map((item: string) => ({ label: item, value: item }));
          this.subcategoryParentValue = pref.category || null;
        }

        if (results.statuses) {
          this.statusOptions = results.statuses.map((item: string) => ({ label: item, value: item }));
        }

        if (results.optionASubOptions) {
          this.optionASubOptions = results.optionASubOptions;
          this.subOptionsLoaded = true;
        }

        if (results.optionADropdown) {
          this.optionADropdownOptions = results.optionADropdown.map((item: string) => ({ label: item, value: item }));
          this.optionADropdownParent = pref.subOption || null;
        }

        if (results.optionBDropdown) {
          this.optionBDropdownOptions = results.optionBDropdown.map((item: string) => ({ label: item, value: item }));
          this.optionBDropdownLoaded = true;
        }

        this.initialLoading = false;

        // If form was completed, show table
        if (pref.formCompleted) {
          this.onContinue();
        }
      },
      error: (err) => {
        this.initialLoading = false;
        this.showError('Failed to load saved preferences: ' + (err.message || err.statusText));
        // Fall back to loading main options only
        this.loadMainOptions();
      }
    });
  }

  // Reset form - unlock fields and clear table
  resetForm(): void {
    this.formLocked = false;
    this.showTable = false;
    this.tableData = [];

    // Clear saved preferences
    this.apiService.deleteUserPreference(this.userId).subscribe();
  }

  // Show error modal with message
  showError(message: string): void {
    this.errorMessage = message;
    this.showErrorModal = true;
  }

  // Close error modal
  closeErrorModal(): void {
    this.showErrorModal = false;
    this.errorMessage = '';
  }

  // Go back to home
  goBack(): void {
    this.router.navigate(['/']);
  }

  // ===== Radio/Dropdown Example Methods =====

  // Load main radio options on init or when section is clicked
  loadMainOptions(): void {
    if (!this.mainOptionsLoaded) {
      this.mainOptionsLoading = true;
      this.apiService.getMainOptions().subscribe({
        next: (data) => {
          this.mainOptions = data;
          this.mainOptionsLoading = false;
          this.mainOptionsLoaded = true;
        },
        error: (err) => {
          this.mainOptionsLoading = false;
          this.showError('Failed to load main options: ' + (err.message || err.statusText));
        }
      });
    }
  }

  // When main option changes
  onMainOptionChange(): void {
    // Reset all dependent values
    this.selectedSubOption = null;
    this.optionASubOptions = [];
    this.subOptionsLoaded = false;
    this.selectedOptionADropdown = null;
    this.optionADropdownOptions = [];
    this.optionADropdownParent = null;
    this.selectedOptionBDropdown = null;
    this.optionBDropdownOptions = [];
    this.optionBDropdownLoaded = false;

    if (this.selectedMainOption === 'Option A') {
      // Load sub-options for Option A
      this.loadOptionASubOptions();
    }
    // Option B dropdown will be loaded on focus
  }

  // Load Option A sub-radio options
  loadOptionASubOptions(): void {
    if (!this.subOptionsLoaded) {
      this.subOptionsLoading = true;
      this.apiService.getOptionASubOptions().subscribe({
        next: (data) => {
          this.optionASubOptions = data;
          this.subOptionsLoading = false;
          this.subOptionsLoaded = true;
        },
        error: (err) => {
          this.subOptionsLoading = false;
          this.showError('Failed to load sub options: ' + (err.message || err.statusText));
        }
      });
    }
  }

  // When Option A sub-option changes
  onSubOptionChange(): void {
    // Reset dropdown
    this.selectedOptionADropdown = null;
    this.optionADropdownOptions = [];
    this.optionADropdownParent = null;
  }

  // Load Option A dropdown on focus
  onOptionADropdownFocus(): void {
    if (!this.selectedSubOption) return;

    // Fetch if empty or parent changed
    if (this.optionADropdownOptions.length === 0 || this.optionADropdownParent !== this.selectedSubOption) {
      this.optionADropdownLoading = true;
      this.apiService.getOptionADropdown(this.selectedSubOption).subscribe({
        next: (data) => {
          this.optionADropdownOptions = data.map(item => ({ label: item, value: item }));
          this.optionADropdownParent = this.selectedSubOption;
          this.optionADropdownLoading = false;
        },
        error: (err) => {
          this.optionADropdownLoading = false;
          this.showError('Failed to load dropdown values: ' + (err.message || err.statusText));
        }
      });
    }
  }

  // Load Option B dropdown on focus
  onOptionBDropdownFocus(): void {
    if (!this.optionBDropdownLoaded) {
      this.optionBDropdownLoading = true;
      this.apiService.getOptionBDropdown().subscribe({
        next: (data) => {
          this.optionBDropdownOptions = data.map(item => ({ label: item, value: item }));
          this.optionBDropdownLoading = false;
          this.optionBDropdownLoaded = true;
        },
        error: (err) => {
          this.optionBDropdownLoading = false;
          this.showError('Failed to load months: ' + (err.message || err.statusText));
        }
      });
    }
  }

  // Category dropdown - load on focus (only if not loaded)
  onCategoryFocus(): void {
    if (this.categoryOptions.length === 0) {
      this.categoryLoading = true;
      this.apiService.getCategories().subscribe({
        next: (data) => {
          this.categoryOptions = data.map(item => ({ label: item, value: item }));
          this.categoryLoading = false;
        },
        error: (err) => {
          this.categoryLoading = false;
          this.showError('Failed to load categories: ' + (err.message || err.statusText));
        }
      });
    }
  }

  // Category change - clear dependent dropdown
  onCategoryChange(): void {
    this.selectedSubcategory = null;
    this.subcategoryOptions = [];
    this.subcategoryParentValue = null;
    this.showTable = false;
  }

  // Subcategory dropdown - load on focus (based on selected category)
  onSubcategoryFocus(): void {
    if (!this.selectedCategory) {
      return;
    }

    // Only fetch if: no options OR parent value changed
    if (this.subcategoryOptions.length === 0 || this.subcategoryParentValue !== this.selectedCategory) {
      this.subcategoryLoading = true;
      this.apiService.getSubcategories(this.selectedCategory).subscribe({
        next: (data) => {
          this.subcategoryOptions = data.map(item => ({ label: item, value: item }));
          this.subcategoryParentValue = this.selectedCategory;
          this.subcategoryLoading = false;
        },
        error: (err) => {
          this.showError('Failed to load subcategories: ' + (err.message || err.statusText));
          this.subcategoryLoading = false;
        }
      });
    }
  }

  onSubcategoryChange(): void {
    this.showTable = false;
  }

  // Status dropdown - load on focus (only if not loaded)
  onStatusFocus(): void {
    if (this.statusOptions.length === 0) {
      this.statusLoading = true;
      this.apiService.getStatuses().subscribe({
        next: (data) => {
          this.statusOptions = data.map(item => ({ label: item, value: item }));
          this.statusLoading = false;
        },
        error: (err) => {
          this.statusLoading = false;
          this.showError('Failed to load statuses: ' + (err.message || err.statusText));
        }
      });
    }
  }

  onStatusChange(): void {
    this.showTable = false;
  }

  // Department dropdown - load on focus (only if not loaded)
  onDepartmentFocus(): void {
    if (this.departmentOptions.length === 0) {
      this.departmentLoading = true;
      this.apiService.getDepartments().subscribe({
        next: (data) => {
          this.departmentOptions = data.map(item => ({ label: item, value: item }));
          this.departmentLoading = false;
        },
        error: (err) => {
          this.departmentLoading = false;
          this.showError('Failed to load departments: ' + (err.message || err.statusText));
        }
      });
    }
  }

  onDepartmentChange(): void {
    this.showTable = false;
  }

  // Region dropdown - load on focus (only if not loaded)
  onRegionFocus(): void {
    if (this.regionOptions.length === 0) {
      this.regionLoading = true;
      this.apiService.getRegions().subscribe({
        next: (data) => {
          this.regionOptions = data.map(item => ({ label: item, value: item }));
          this.regionLoading = false;
        },
        error: (err) => {
          this.regionLoading = false;
          this.showError('Failed to load regions: ' + (err.message || err.statusText));
        }
      });
    }
  }

  onRegionChange(): void {
    this.showTable = false;
  }

  // Type dropdown - load on focus (only if not loaded)
  onTypeFocus(): void {
    if (this.typeOptions.length === 0) {
      this.typeLoading = true;
      this.apiService.getTypes().subscribe({
        next: (data) => {
          this.typeOptions = data.map(item => ({ label: item, value: item }));
          this.typeLoading = false;
        },
        error: (err) => {
          this.typeLoading = false;
          this.showError('Failed to load types: ' + (err.message || err.statusText));
        }
      });
    }
  }

  onTypeChange(): void {
    this.showTable = false;
  }

  // Gender dropdown - load on focus (only if not loaded)
  onGenderFocus(): void {
    if (this.genderOptions.length === 0) {
      this.genderLoading = true;
      this.apiService.getGenders().subscribe({
        next: (data) => {
          this.genderOptions = data.map(item => ({ label: item, value: item }));
          this.genderLoading = false;
        },
        error: (err) => {
          this.genderLoading = false;
          this.showError('Failed to load genders: ' + (err.message || err.statusText));
        }
      });
    }
  }

  onGenderChange(): void {
    this.showTable = false;
  }

  // Continue button - load table data and save preferences
  onContinue(): void {
    this.tableLoading = true;
    this.showTable = false;

    // Build query parameters
    const params: any = {
      category: this.selectedCategory || '',
      subcategory: this.selectedSubcategory || '',
      status: this.selectedStatus || '',
      mainOption: this.selectedMainOption || ''
    };

    // Add Option A specific params
    if (this.selectedMainOption === 'Option A') {
      params.subOption = this.selectedSubOption || '';
      params.optionAValue = this.selectedOptionADropdown || '';
    }

    // Add Option B specific params
    if (this.selectedMainOption === 'Option B') {
      params.optionBValue = this.selectedOptionBDropdown || '';
    }

    this.apiService.getDataWithAllParams(params).subscribe({
      next: (data) => {
        this.tableData = data;
        this.tableLoading = false;
        this.showTable = true;
        this.formLocked = true; // Lock form after successful load

        // Save user preferences
        this.saveUserPreferences(true);
      },
      error: (err) => {
        this.tableLoading = false;
        this.showError('Failed to load data: ' + (err.message || err.statusText));
      }
    });
  }

  // Save user preferences to backend
  saveUserPreferences(formCompleted: boolean): void {
    const preference: UserPreference = {
      userId: this.userId,
      category: this.selectedCategory || undefined,
      subcategory: this.selectedSubcategory || undefined,
      status: this.selectedStatus || undefined,
      mainOption: this.selectedMainOption || undefined,
      subOption: this.selectedSubOption || undefined,
      optionAValue: this.selectedOptionADropdown || undefined,
      optionBValue: this.selectedOptionBDropdown || undefined,
      formCompleted: formCompleted
    };

    this.apiService.saveUserPreference(this.userId, preference).subscribe({
      error: (err) => {
        console.error('Failed to save preferences:', err);
      }
    });
  }

  // Check if continue button should be enabled
  canContinue(): boolean {
    // Must have category, subcategory, and status
    const baseValid = !!(this.selectedCategory && this.selectedSubcategory && this.selectedStatus);

    // Must have main option selected
    if (!this.selectedMainOption) {
      return false;
    }

    // If Option A: must have sub-option and dropdown value
    if (this.selectedMainOption === 'Option A') {
      return baseValid && !!(this.selectedSubOption && this.selectedOptionADropdown);
    }

    // If Option B: must have dropdown value
    if (this.selectedMainOption === 'Option B') {
      return baseValid && !!this.selectedOptionBDropdown;
    }

    return baseValid;
  }
}
