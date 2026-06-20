import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

export interface WhoisData {
    domain_name?: string | string[];
    registrar?: string;
    whois_server?: string;
    referral_url?: string;
    updated_date?: string | string[];
    creation_date?: string | string[];
    expiration_date?: string | string[];
    name_servers?: string[];
    status?: string | string[];
    emails?: string | string[];
    dnssec?: string;
    name?: string;
    org?: string;
    address?: string;
    city?: string;
    state?: string;
    zipcode?: string;
    country?: string;
}

export interface DnsData {
    A?: string[];
    MX?: string[];
    TXT?: string[];
    NS?: string[];
}

export interface DomainAnalysisResult {
    domain: string;
    whois: WhoisData;
    dns: DnsData;
}

export const domainService = {
    analyze: async (domain: string): Promise<DomainAnalysisResult> => {
        const response = await axios.get(`${API_BASE_URL}/domain/${domain}`);
        return response.data;
    },
};


export interface BreachResult {
    email: string;
    risk_score: number;
    breaches: Array<{
        title: string;
        url: string;
        snippet: string;
        source: string;
    }>;
    pastes: Array<{
        title: string;
        url: string;
        snippet: string;
        source: string;
    }>;
    dark_web_mentions: Array<{
        title: string;
        url: string;
        snippet: string;
        source: string;
    }>;
}

export const breachService = {
    check: async (email: string): Promise<BreachResult> => {
        const response = await axios.get(`${API_BASE_URL}/breach/${email}`);
        return response.data;
    }
}

export interface PersonSearchRequest {
    name?: string;
    email?: string;
    phone?: string;
}

export const api = {
    ...domainService, // keeping backward compatibility if needed, or better, creating a unified object
    searchPerson: async (params: PersonSearchRequest) => {
        const response = await axios.post(`${API_BASE_URL}/person/search`, params);
        return response.data;
    },
    // Re-exporting others for ease of use in new components
    getDomain: domainService.analyze,
    checkBreach: breachService.check
};
