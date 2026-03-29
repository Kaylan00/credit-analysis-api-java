package br.com.serasa.creditanalysis.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public class CreditProposalRequest {

    @NotBlank(message = "CPF is required")
    @Pattern(regexp = "\\d{3}\\.\\d{3}\\.\\d{3}-\\d{2}", message = "CPF must follow the pattern 000.000.000-00")
    private String cpf;

    @NotBlank(message = "Full name is required")
    @Size(min = 3, max = 100, message = "Full name must be between 3 and 100 characters")
    private String fullName;

    @NotNull(message = "Monthly income is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Monthly income must be greater than zero")
    private BigDecimal monthlyIncome;

    @NotNull(message = "Age is required")
    @Min(value = 18, message = "Applicant must be at least 18 years old")
    @Max(value = 120, message = "Invalid age")
    private Integer age;

    public String getCpf() { return cpf; }
    public void setCpf(String cpf) { this.cpf = cpf; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public BigDecimal getMonthlyIncome() { return monthlyIncome; }
    public void setMonthlyIncome(BigDecimal monthlyIncome) { this.monthlyIncome = monthlyIncome; }
    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }
}