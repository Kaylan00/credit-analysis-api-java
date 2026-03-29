package br.com.serasa.creditanalysis;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CreditProposalRepository extends JpaRepository<CreditProposal, Long> {

    boolean existsByCpf(String cpf);

    Optional<CreditProposal> findByCpf(String cpf);

    Page<CreditProposal> findByRiskLevel(RiskLevel riskLevel, Pageable pageable);

    Page<CreditProposal> findByFullNameContainingIgnoreCase(String fullName, Pageable pageable);
}