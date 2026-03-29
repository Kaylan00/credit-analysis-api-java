package br.com.serasa.creditanalysis;

import br.com.serasa.creditanalysis.dto.CreditProposalRequest;
import br.com.serasa.creditanalysis.dto.CreditProposalResponse;
import br.com.serasa.creditanalysis.exception.DuplicateCpfException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class CreditAnalysisService {

    private final CreditProposalRepository repository;

    public CreditAnalysisService(CreditProposalRepository repository) {
        this.repository = repository;
    }

    public CreditProposalResponse evaluate(CreditProposalRequest request) {
        if (repository.existsByCpf(request.getCpf())) {
            throw new DuplicateCpfException(request.getCpf());
        }

        CreditProposal proposal = new CreditProposal();
        proposal.setCpf(request.getCpf());
        proposal.setFullName(request.getFullName());
        proposal.setMonthlyIncome(request.getMonthlyIncome());
        proposal.setAge(request.getAge());

        int score = calculateScore(proposal);
        proposal.setCalculatedScore(score);
        proposal.setRiskLevel(determineRisk(score));

        CreditProposal saved = repository.save(proposal);
        return toResponse(saved);
    }

    public Page<CreditProposalResponse> findAll(Pageable pageable) {
        return repository.findAll(pageable).map(this::toResponse);
    }

    public Page<CreditProposalResponse> findByRisk(RiskLevel riskLevel, Pageable pageable) {
        return repository.findByRiskLevel(riskLevel, pageable).map(this::toResponse);
    }

    public Page<CreditProposalResponse> findByName(String name, Pageable pageable) {
        return repository.findByFullNameContainingIgnoreCase(name, pageable).map(this::toResponse);
    }

    private int calculateScore(CreditProposal proposal) {
        int score = 500;
        if (proposal.getMonthlyIncome().doubleValue() > 5000) score += 200;
        if (proposal.getAge() > 30) score += 100;
        if (proposal.getAge() > 50) score += 50;
        return Math.min(score, 1000);
    }

    private RiskLevel determineRisk(int score) {
        if (score >= 800) return RiskLevel.LOW;
        if (score >= 600) return RiskLevel.MEDIUM;
        if (score >= 400) return RiskLevel.HIGH;
        return RiskLevel.REJECTED;
    }

    private CreditProposalResponse toResponse(CreditProposal p) {
        return new CreditProposalResponse(
                p.getId(), p.getCpf(), p.getFullName(),
                p.getMonthlyIncome(), p.getAge(),
                p.getCalculatedScore(), p.getRiskLevel(), p.getCreatedAt()
        );
    }
}