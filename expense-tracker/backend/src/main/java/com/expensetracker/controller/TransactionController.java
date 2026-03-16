package com.expensetracker.controller;

import com.expensetracker.dto.ApiResponse;
import com.expensetracker.dto.SummaryDTO;
import com.expensetracker.dto.TransactionRequestDTO;
import com.expensetracker.dto.TransactionResponseDTO;
import com.expensetracker.model.TransactionType;
import com.expensetracker.service.TransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class TransactionController {

    private final TransactionService transactionService;

    // POST /api/transactions
    @PostMapping
    public ResponseEntity<ApiResponse<TransactionResponseDTO>> createTransaction(
            @Valid @RequestBody TransactionRequestDTO requestDTO) {
        TransactionResponseDTO response = transactionService.createTransaction(requestDTO);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Transaction created successfully", response));
    }

    // GET /api/transactions/{id}
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TransactionResponseDTO>> getTransactionById(@PathVariable Long id) {
        TransactionResponseDTO response = transactionService.getTransactionById(id);
        return ResponseEntity.ok(ApiResponse.success("Transaction fetched", response));
    }

    // GET /api/transactions  (with optional filters)
    @GetMapping
    public ResponseEntity<ApiResponse<List<TransactionResponseDTO>>> getAllTransactions(
            @RequestParam(required = false) TransactionType type,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) String search) {

        List<TransactionResponseDTO> response;

        if (search != null && !search.isBlank()) {
            response = transactionService.searchTransactions(search);
        } else if (type != null && startDate != null && endDate != null) {
            response = transactionService.getTransactionsByTypeAndDateRange(type, startDate, endDate);
        } else if (type != null) {
            response = transactionService.getTransactionsByType(type);
        } else if (startDate != null && endDate != null) {
            response = transactionService.getTransactionsByDateRange(startDate, endDate);
        } else {
            response = transactionService.getAllTransactions();
        }

        return ResponseEntity.ok(ApiResponse.success("Transactions fetched", response));
    }

    // PUT /api/transactions/{id}
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<TransactionResponseDTO>> updateTransaction(
            @PathVariable Long id,
            @Valid @RequestBody TransactionRequestDTO requestDTO) {
        TransactionResponseDTO response = transactionService.updateTransaction(id, requestDTO);
        return ResponseEntity.ok(ApiResponse.success("Transaction updated successfully", response));
    }

    // DELETE /api/transactions/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTransaction(@PathVariable Long id) {
        transactionService.deleteTransaction(id);
        return ResponseEntity.ok(ApiResponse.success("Transaction deleted successfully", null));
    }

    // GET /api/transactions/summary
    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<SummaryDTO>> getSummary() {
        SummaryDTO summary = transactionService.getSummary();
        return ResponseEntity.ok(ApiResponse.success("Summary fetched", summary));
    }
}
