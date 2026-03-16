package com.expensetracker.service;

import com.expensetracker.dto.SummaryDTO;
import com.expensetracker.dto.TransactionRequestDTO;
import com.expensetracker.dto.TransactionResponseDTO;
import com.expensetracker.model.TransactionType;

import java.time.LocalDate;
import java.util.List;

public interface TransactionService {

    TransactionResponseDTO createTransaction(TransactionRequestDTO requestDTO);

    TransactionResponseDTO getTransactionById(Long id);

    List<TransactionResponseDTO> getAllTransactions();

    List<TransactionResponseDTO> getTransactionsByType(TransactionType type);

    List<TransactionResponseDTO> getTransactionsByDateRange(LocalDate startDate, LocalDate endDate);

    List<TransactionResponseDTO> getTransactionsByTypeAndDateRange(TransactionType type, LocalDate startDate, LocalDate endDate);

    List<TransactionResponseDTO> searchTransactions(String keyword);

    TransactionResponseDTO updateTransaction(Long id, TransactionRequestDTO requestDTO);

    void deleteTransaction(Long id);

    SummaryDTO getSummary();
}
