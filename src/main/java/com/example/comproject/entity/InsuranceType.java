package com.example.comproject.entity;

public enum InsuranceType {
    GENERAL_LIABILITY("General Liability"),
    AUTO("Auto"),
    WORKERS_COMPENSATION("Workers compensation"),
    PROPERTY_DAMAGE("Property Damage");

    private final String displayName;

    InsuranceType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
