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
import com.expensetracker.model.User;
import com.expensetracker.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.Authentication;

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
        private final UserRepository userRepository;

        @Override
        public TransactionResponseDTO createTransaction(
                        TransactionRequestDTO dto) {

                User user = getCurrentUser();

                Transaction transaction = Transaction.builder()
                                .user(user)
                                .description(dto.getDescription())
                                .amount(dto.getAmount())
                                .type(dto.getType())
                                .category(dto.getCategory())
                                .date(dto.getDate())
                                .notes(dto.getNotes())
                                .build();

                Transaction saved = transactionRepository.save(transaction);

                return mapToResponseDTO(saved);
        }

        @Override
        @Transactional(readOnly = true)
        public TransactionResponseDTO getTransactionById(Long id) {
                return mapToResponseDTO(findByIdAndCurrentUser(id));
        }

        @Override
        @Transactional(readOnly = true)
        public List<TransactionResponseDTO> getAllTransactions() {
                User user = getCurrentUser();

                return transactionRepository
                                .findByUserIdOrderByDateDesc(user.getId())
                                .stream()
                                .map(this::mapToResponseDTO)
                                .collect(Collectors.toList());
        }

        @Override
        @Transactional(readOnly = true)
        public List<TransactionResponseDTO> getTransactionsByType(
                        TransactionType type) {

                User user = getCurrentUser();

                return transactionRepository
                                .findByUserIdAndTypeOrderByDateDesc(user.getId(), type)
                                .stream()
                                .map(this::mapToResponseDTO)
                                .collect(Collectors.toList());
        }

        @Override
        @Transactional(readOnly = true)
        public List<TransactionResponseDTO> getTransactionsByDateRange(
                        LocalDate startDate,
                        LocalDate endDate) {

                User user = getCurrentUser();

                return transactionRepository
                                .findByUserIdAndDateBetweenOrderByDateDesc(
                                                user.getId(), startDate, endDate)
                                .stream()
                                .map(this::mapToResponseDTO)
                                .collect(Collectors.toList());
        }

        @Override
        @Transactional(readOnly = true)
        public List<TransactionResponseDTO> getTransactionsByTypeAndDateRange(
                        TransactionType type,
                        LocalDate startDate,
                        LocalDate endDate) {

                User user = getCurrentUser();

                return transactionRepository
                                .findByUserIdAndTypeAndDateBetweenOrderByDateDesc(
                                                user.getId(), type, startDate, endDate)
                                .stream()
                                .map(this::mapToResponseDTO)
                                .collect(Collectors.toList());
        }

        @Override
        @Transactional(readOnly = true)
        public List<TransactionResponseDTO> searchTransactions(String keyword) {
                User user = getCurrentUser();

                return transactionRepository
                                .findByUserIdAndDescriptionContainingIgnoreCaseOrderByDateDesc(
                                                user.getId(), keyword)
                                .stream()
                                .map(this::mapToResponseDTO)
                                .collect(Collectors.toList());
        }

        @Override
        public TransactionResponseDTO updateTransaction(
                        Long id,
                        TransactionRequestDTO dto) {

                Transaction transaction = findByIdAndCurrentUser(id);

                transaction.setDescription(dto.getDescription());
                transaction.setAmount(dto.getAmount());
                transaction.setType(dto.getType());
                transaction.setCategory(dto.getCategory());
                transaction.setDate(dto.getDate());
                transaction.setNotes(dto.getNotes());

                return mapToResponseDTO(transactionRepository.save(transaction));
        }

        @Override
        public void deleteTransaction(Long id) {
                Transaction transaction = findByIdAndCurrentUser(id);
                transactionRepository.delete(transaction);
        }

        @Override
        @Transactional(readOnly = true)
        public SummaryDTO getSummary() {

                User user = getCurrentUser();
                Long userId = user.getId();

                BigDecimal totalIncome = transactionRepository.sumByUserIdAndType(
                                userId, TransactionType.INCOME);

                BigDecimal totalExpense = transactionRepository.sumByUserIdAndType(
                                userId, TransactionType.EXPENSE);

                BigDecimal balance = totalIncome.subtract(totalExpense);

                BigDecimal savingsRate = BigDecimal.ZERO;

                if (totalIncome.compareTo(BigDecimal.ZERO) > 0) {
                        savingsRate = balance
                                        .divide(totalIncome, 4, RoundingMode.HALF_UP)
                                        .multiply(BigDecimal.valueOf(100))
                                        .setScale(2, RoundingMode.HALF_UP);
                }

                Map<String, BigDecimal> expenseByCategory = new LinkedHashMap<>();

                transactionRepository
                                .sumByUserIdAndTypeGroupedByCategory(
                                                userId, TransactionType.EXPENSE)
                                .forEach(row -> expenseByCategory.put(
                                                (String) row[0],
                                                (BigDecimal) row[1]));

                Map<String, BigDecimal> incomeByCategory = new LinkedHashMap<>();

                transactionRepository
                                .sumByUserIdAndTypeGroupedByCategory(
                                                userId, TransactionType.INCOME)
                                .forEach(row -> incomeByCategory.put(
                                                (String) row[0],
                                                (BigDecimal) row[1]));

                return SummaryDTO.builder()
                                .totalIncome(totalIncome)
                                .totalExpense(totalExpense)
                                .balance(balance)
                                .savingsRate(savingsRate)
                                .incomeCount((int) transactionRepository
                                                .countByUserIdAndType(
                                                                userId, TransactionType.INCOME))
                                .expenseCount((int) transactionRepository
                                                .countByUserIdAndType(
                                                                userId, TransactionType.EXPENSE))
                                .expenseByCategory(expenseByCategory)
                                .incomeByCategory(incomeByCategory)
                                .build();
        }

        // ---- Helpers ----

        private Transaction findById(Long id) {
                return transactionRepository.findById(id)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Transaction not found with id: " + id));
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

        private User getCurrentUser() {
                Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

                if (authentication == null
                                || !authentication.isAuthenticated()
                                || authentication.getPrincipal().equals("anonymousUser")) {
                        throw new org.springframework.security.access.AccessDeniedException(
                                        "User is not authenticated");
                }

                String email = authentication.getName();

                return userRepository.findByEmail(email)
                                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));
        }

        private Transaction findByIdAndCurrentUser(Long id) {
                User user = getCurrentUser();

                return transactionRepository.findByIdAndUserId(id, user.getId())
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Transaction not found with id: " + id));
        }
}
