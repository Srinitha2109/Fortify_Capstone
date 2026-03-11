package com.example.comproject.dto;

import java.math.BigDecimal;
import java.util.List;

public class PolicyFilterRequestDTO {

    private List<String> insuranceTypes;

    private RangeDTO premiumRange;
    private RangeDTO coverageRange;

    private List<Integer> duration;
    private List<String> keywords;

    private SortDTO sort;

    // ── Inner: Range ──
    public static class RangeDTO {
        private BigDecimal min;
        private BigDecimal max;

        public BigDecimal getMin() { return min; }
        public void setMin(BigDecimal min) { this.min = min; }
        public BigDecimal getMax() { return max; }
        public void setMax(BigDecimal max) { this.max = max; }
    }

    // ── Inner: Sort ──
    public static class SortDTO {
        private String field;
        private String direction;

        public String getField() { return field; }
        public void setField(String field) { this.field = field; }
        public String getDirection() { return direction; }
        public void setDirection(String direction) { this.direction = direction; }
    }

    public List<String> getInsuranceTypes() { return insuranceTypes; }
    public void setInsuranceTypes(List<String> insuranceTypes) { this.insuranceTypes = insuranceTypes; }
    public RangeDTO getPremiumRange() { return premiumRange; }
    public void setPremiumRange(RangeDTO premiumRange) { this.premiumRange = premiumRange; }
    public RangeDTO getCoverageRange() { return coverageRange; }
    public void setCoverageRange(RangeDTO coverageRange) { this.coverageRange = coverageRange; }
    public List<Integer> getDuration() { return duration; }
    public void setDuration(List<Integer> duration) { this.duration = duration; }
    public List<String> getKeywords() { return keywords; }
    public void setKeywords(List<String> keywords) { this.keywords = keywords; }
    public SortDTO getSort() { return sort; }
    public void setSort(SortDTO sort) { this.sort = sort; }
}