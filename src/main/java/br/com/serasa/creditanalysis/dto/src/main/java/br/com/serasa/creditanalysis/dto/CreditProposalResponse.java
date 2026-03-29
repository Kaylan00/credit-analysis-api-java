package br.com.serasa.creditanalysis.dto;

import br.com.serasa.creditanalysis.RiskLevel;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class CreditProposalResponse {

    private Long id;
    private String cpf;
    private String fullName;
    private BigDecimal monthlyIncome;
    private Integer age;
    private Integer calculatedScore;
    private RiskLevel riskLevel;
    private LocalDateTime createdAt;

    public CreditProposalResponse() {}

    public CreditProposalResponse(Long id, String cpf, String fullName, BigDecimal monthlyIncome,
                                   Integer age, Integer calculatedScore, RiskLevel riskLevel,
                                   LocalDateTime createdAt) {
        this.id = id;
        this.cpf = cpf;
        this.fullName = fullName;
        this.monthlyIncome = monthlyIncome;
        this.age = age;
        this.calculatedScore = calculatedScore;
        this.riskLevel = riskLevel;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public String getCpf() { return cpf; }
    public String getFullName() { return fullName; }
    public BigDecimal getMonthlyIncome() { return monthlyIncome; }
    public Integer getAge() { return age; }
    public Integer getCalculatedScore() { return calculatedScore; }
    public RiskLevel getRiskLevel() { return riskLevel; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}