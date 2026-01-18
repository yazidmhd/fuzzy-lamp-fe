import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface DataItem {
  id: number;
  name: string;
  category: string;
  subcategory: string;
  status: string;
  description: string;
}

export interface UserPreference {
  userId: string;
  category?: string;
  subcategory?: string;
  status?: string;
  mainOption?: string;
  subOption?: string;
  optionAValue?: string;
  optionBValue?: string;
  formCompleted: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getCategories(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/dropdown/categories`);
  }

  getSubcategories(category: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/dropdown/subcategories?category=${category}`);
  }

  getStatuses(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/dropdown/statuses`);
  }

  getPriorities(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/dropdown/priorities`);
  }

  getTypes(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/dropdown/types`);
  }

  getRegions(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/dropdown/regions`);
  }

  getDepartments(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/dropdown/departments`);
  }

  getGenders(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/dropdown/genders`);
  }

  getData(category: string, subcategory: string, status: string): Observable<DataItem[]> {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (subcategory) params.append('subcategory', subcategory);
    if (status) params.append('status', status);

    return this.http.get<DataItem[]>(`${this.apiUrl}/data?${params.toString()}`);
  }

  // New methods for radio/dropdown example
  getMainOptions(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/radio/main-options`);
  }

  getOptionASubOptions(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/radio/option-a-sub-options`);
  }

  getOptionADropdown(subOption: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/dropdown/option-a-values?subOption=${subOption}`);
  }

  getOptionBDropdown(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/dropdown/option-b-values`);
  }

  // Combined query with all parameters
  getDataWithAllParams(params: {
    category?: string;
    subcategory?: string;
    status?: string;
    mainOption?: string;
    subOption?: string;
    optionAValue?: string;
    optionBValue?: string;
  }): Observable<DataItem[]> {
    const queryParams = new URLSearchParams();

    if (params.category) queryParams.append('category', params.category);
    if (params.subcategory) queryParams.append('subcategory', params.subcategory);
    if (params.status) queryParams.append('status', params.status);
    if (params.mainOption) queryParams.append('mainOption', params.mainOption);
    if (params.subOption) queryParams.append('subOption', params.subOption);
    if (params.optionAValue) queryParams.append('optionAValue', params.optionAValue);
    if (params.optionBValue) queryParams.append('optionBValue', params.optionBValue);

    return this.http.get<DataItem[]>(`${this.apiUrl}/data/query?${queryParams.toString()}`);
  }

  // User preference methods
  getUserPreference(userId: string): Observable<UserPreference> {
    return this.http.get<UserPreference>(`${this.apiUrl}/preferences/${userId}`);
  }

  saveUserPreference(userId: string, preference: UserPreference): Observable<UserPreference> {
    return this.http.post<UserPreference>(`${this.apiUrl}/preferences/${userId}`, preference);
  }

  deleteUserPreference(userId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/preferences/${userId}`);
  }
}
