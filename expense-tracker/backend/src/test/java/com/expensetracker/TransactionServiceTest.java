package com.expensetracker;

import com.expensetracker.dto.TransactionRequestDTO;
import com.expensetracker.dto.TransactionResponseDTO;
import com.expensetracker.exception.ResourceNotFoundException;
import com.expensetracker.model.Transaction;
import com.expensetracker.model.TransactionType;
import com.expensetracker.repository.TransactionRepository;
import com.expensetracker.service.TransactionServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TransactionServiceTest {

    @Mock
    private TransactionRepository transactionRepository;

    @InjectMocks
    private TransactionServiceImpl transactionService;

    private Transaction sampleTransaction;
    private TransactionRequestDTO sampleRequest;

    @BeforeEach
    void setUp() {
        sampleTransaction = Transaction.builder()
                .id(1L)
                .description("Test Salary")
                .amount(new BigDecimal("50000.00"))
                .type(TransactionType.INCOME)
                .category("salary")
                .date(LocalDate.now())
                .build();

        sampleRequest = TransactionRequestDTO.builder()
                .description("Test Salary")
                .amount(new BigDecimal("50000.00"))
                .type(TransactionType.INCOME)
                .category("salary")
                .date(LocalDate.now())
                .build();
    }

    @Test
    void createTransaction_ShouldReturnSavedTransaction() {
        when(transactionRepository.save(any(Transaction.class))).thenReturn(sampleTransaction);
        TransactionResponseDTO result = transactionService.createTransaction(sampleRequest);
        assertThat(result).isNotNull();
        assertThat(result.getDescription()).isEqualTo("Test Salary");
        assertThat(result.getType()).isEqualTo(TransactionType.INCOME);
        verify(transactionRepository, times(1)).save(any(Transaction.class));
    }

    @Test
    void getTransactionById_ShouldReturnTransaction_WhenExists() {
        when(transactionRepository.findById(1L)).thenReturn(Optional.of(sampleTransaction));
        TransactionResponseDTO result = transactionService.getTransactionById(1L);
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
    }

    @Test
    void getTransactionById_ShouldThrowException_WhenNotFound() {
        when(transactionRepository.findById(99L)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> transactionService.getTransactionById(99L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("99");
    }

    @Test
    void getAllTransactions_ShouldReturnList() {
        when(transactionRepository.findAllByOrderByDateDesc()).thenReturn(List.of(sampleTransaction));
        List<TransactionResponseDTO> result = transactionService.getAllTransactions();
        assertThat(result).hasSize(1);
    }

    @Test
    void deleteTransaction_ShouldDeleteSuccessfully() {
        when(transactionRepository.findById(1L)).thenReturn(Optional.of(sampleTransaction));
        doNothing().when(transactionRepository).delete(sampleTransaction);
        transactionService.deleteTransaction(1L);
        verify(transactionRepository, times(1)).delete(sampleTransaction);
    }
}
