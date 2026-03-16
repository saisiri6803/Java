package com.expensetracker.service;

import com.expensetracker.dto.SummaryDTO;
import com.expensetracker.dto.TransactionRequestDTO;
import com.expensetracker.dto.TransactionResponseDTO;
import com.expensetracker.exception.ResourceNotFoundException;
import com.expensetracker.model.Transaction;
import com.expensetracker.model.TransactionType;
import com.expensetracker.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class TransactionServiceImpl implements TransactionService {

    private final TransactionRepository transactionRepository;

    @Override
    public TransactionResponseDTO createTransaction(TransactionRequestDTO dto) {
        log.debug("Creating transaction: {}", dto);
        Transaction transaction = Transaction.builder()
                .description(dto.getDescription())
                .amount(dto.getAmount())
                .type(dto.getType())
                .category(dto.getCategory())
                .date(dto.getDate())
                .notes(dto.getNotes())
                .build();
        Transaction saved = transactionRepository.save(transaction);
        log.info("Transaction created with id: {}", saved.getId());
        return mapToResponseDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public TransactionResponseDTO getTransactionById(Long id) {
        Transaction transaction = findById(id);
        return mapToResponseDTO(transaction);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TransactionResponseDTO> getAllTransactions() {
        return transactionRepository.findAllByOrderByDateDesc()
                .stream().map(this::mapToResponseDTO).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<TransactionResponseDTO> getTransactionsByType(TransactionType type) {
        return transactionRepository.findByTypeOrderByDateDesc(type)
                .stream().map(this::mapToResponseDTO).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<TransactionResponseDTO> getTransactionsByDateRange(LocalDate startDate, LocalDate endDate) {
        return transactionRepository.findByDateBetweenOrderByDateDesc(startDate, endDate)
                .stream().map(this::mapToResponseDTO).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<TransactionResponseDTO> getTransactionsByTypeAndDateRange(TransactionType type, LocalDate startDate, LocalDate endDate) {
        return transactionRepository.findByTypeAndDateBetweenOrderByDateDesc(type, startDate, endDate)
                .stream().map(this::mapToResponseDTO).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<TransactionResponseDTO> searchTransactions(String keyword) {
        return transactionRepository.findByDescriptionContainingIgnoreCaseOrderByDateDesc(keyword)
                .stream().map(this::mapToResponseDTO).collect(Collectors.toList());
    }

    @Override
    public TransactionResponseDTO updateTransaction(Long id, TransactionRequestDTO dto) {
        Transaction transaction = findById(id);
        transaction.setDescription(dto.getDescription());
        transaction.setAmount(dto.getAmount());
        transaction.setType(dto.getType());
        transaction.setCategory(dto.getCategory());
        transaction.setDate(dto.getDate());
        transaction.setNotes(dto.getNotes());
        Transaction updated = transactionRepository.save(transaction);
        log.info("Transaction updated with id: {}", updated.getId());
        return mapToResponseDTO(updated);
    }

    @Override
    public void deleteTransaction(Long id) {
        Transaction transaction = findById(id);
        transactionRepository.delete(transaction);
        log.info("Transaction deleted with id: {}", id);
    }

    @Override
    @Transactional(readOnly = true)
    public SummaryDTO getSummary() {
        BigDecimal totalIncome = transactionRepository.sumIncome();
        BigDecimal totalExpense = transactionRepository.sumExpense();
        BigDecimal balance = totalIncome.subtract(totalExpense);

        BigDecimal savingsRate = BigDecimal.ZERO;
        if (totalIncome.compareTo(BigDecimal.ZERO) > 0) {
            savingsRate = balance.divide(totalIncome, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100))
                    .setScale(2, RoundingMode.HALF_UP);
        }

        Map<String, BigDecimal> expenseByCategory = new LinkedHashMap<>();
        transactionRepository.sumExpenseByCategory().forEach(row ->
                expenseByCategory.put((String) row[0], (BigDecimal) row[1]));

        Map<String, BigDecimal> incomeByCategory = new LinkedHashMap<>();
        transactionRepository.sumIncomeByCategory().forEach(row ->
                incomeByCategory.put((String) row[0], (BigDecimal) row[1]));

        return SummaryDTO.builder()
                .totalIncome(totalIncome)
                .totalExpense(totalExpense)
                .balance(balance)
                .savingsRate(savingsRate)
                .incomeCount((int) transactionRepository.countByType(TransactionType.INCOME))
                .expenseCount((int) transactionRepository.countByType(TransactionType.EXPENSE))
                .expenseByCategory(expenseByCategory)
                .incomeByCategory(incomeByCategory)
                .build();
    }

    // ---- Helpers ----

    private Transaction findById(Long id) {
        return transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found with id: " + id));
    }

    private TransactionResponseDTO mapToResponseDTO(Transaction t) {
        return TransactionResponseDTO.builder()
                .id(t.getId())
                .description(t.getDescription())
                .amount(t.getAmount())
                .type(t.getType())
                .category(t.getCategory())
                .date(t.getDate())
                .notes(t.getNotes())
                .createdAt(t.getCreatedAt())
                .updatedAt(t.getUpdatedAt())
                .build();
    }
}
