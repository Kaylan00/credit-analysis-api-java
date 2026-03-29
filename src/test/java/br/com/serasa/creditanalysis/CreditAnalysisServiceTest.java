package br.com.serasa.creditanalysis;

import br.com.serasa.creditanalysis.dto.CreditProposalRequest;
import br.com.serasa.creditanalysis.dto.CreditProposalResponse;
import br.com.serasa.creditanalysis.exception.DuplicateCpfException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class CreditAnalysisServiceTest {

    @Mock
    private CreditProposalRepository repository;

    @InjectMocks
    private CreditAnalysisService service;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    private CreditProposalRequest buildRequest(String cpf, double income, int age) {
        CreditProposalRequest req = new CreditProposalRequest();
        req.setCpf(cpf);
        req.setFullName("Test User");
        req.setMonthlyIncome(BigDecimal.valueOf(income));
        req.setAge(age);
        return req;
    }

    @Test
    void shouldReturnLowRiskForHighIncomeAndAge() {
        when(repository.existsByCpf(any())).thenReturn(false);
        when(repository.save(any())).thenAnswer(i -> {
            CreditProposal p = i.getArgument(0);
            p.setId(1L);
            return p;
        });

        CreditProposalResponse response = service.evaluate(buildRequest("123.456.789-00", 6000, 35));

        assertEquals(RiskLevel.LOW, response.getRiskLevel());
        assertEquals(800, response.getCalculatedScore());
    }

    @Test
    void shouldReturnHighRiskForLowIncomeAndAge() {
        when(repository.existsByCpf(any())).thenReturn(false);
        when(repository.save(any())).thenAnswer(i -> {
            CreditProposal p = i.getArgument(0);
            p.setId(2L);
            return p;
        });

        CreditProposalResponse response = service.evaluate(buildRequest("987.654.321-00", 2000, 20));

        assertEquals(RiskLevel.HIGH, response.getRiskLevel());
        assertEquals(500, response.getCalculatedScore());
    }

    @Test
    void shouldThrowExceptionForDuplicateCpf() {
        when(repository.existsByCpf("123.456.789-00")).thenReturn(true);

        assertThrows(DuplicateCpfException.class,
                () -> service.evaluate(buildRequest("123.456.789-00", 5000, 25)));
    }
}