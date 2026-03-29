package br.com.serasa.creditanalysis;

import br.com.serasa.creditanalysis.dto.CreditProposalRequest;
import br.com.serasa.creditanalysis.dto.CreditProposalResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/proposals")
@Tag(name = "Credit Analysis", description = "Endpoints for credit proposal evaluation")
public class CreditProposalController {

    private final CreditAnalysisService service;

    public CreditProposalController(CreditAnalysisService service) {
        this.service = service;
    }

    @PostMapping
    @Operation(summary = "Submit a credit proposal", description = "Evaluates the applicant's data and returns a risk score")
    public ResponseEntity<CreditProposalResponse> create(@Valid @RequestBody CreditProposalRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.evaluate(request));
    }

    @GetMapping
    @Operation(summary = "List all proposals", description = "Returns a paginated list. Filter by riskLevel or name using query params.")
    public ResponseEntity<Page<CreditProposalResponse>> findAll(
            @RequestParam(required = false) RiskLevel riskLevel,
            @RequestParam(required = false) String name,
            @PageableDefault(size = 10, sort = "createdAt") Pageable pageable) {

        if (riskLevel != null) {
            return ResponseEntity.ok(service.findByRisk(riskLevel, pageable));
        }
        if (name != null && !name.isBlank()) {
            return ResponseEntity.ok(service.findByName(name, pageable));
        }
        return ResponseEntity.ok(service.findAll(pageable));
    }
}