package com.expensetracker.repository;

import com.expensetracker.model.Transaction;
import com.expensetracker.model.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    // Find by type
    List<Transaction> findByTypeOrderByDateDesc(TransactionType type);

    // Find all ordered by date
    List<Transaction> findAllByOrderByDateDesc();

    // Find by date range
    List<Transaction> findByDateBetweenOrderByDateDesc(LocalDate startDate, LocalDate endDate);

    // Find by type and date range
    List<Transaction> findByTypeAndDateBetweenOrderByDateDesc(TransactionType type, LocalDate startDate, LocalDate endDate);

    // Find by category
    List<Transaction> findByCategoryAndTypeOrderByDateDesc(String category, TransactionType type);

    // Sum of all income
    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.type = 'INCOME'")
    BigDecimal sumIncome();

    // Sum of all expenses
    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.type = 'EXPENSE'")
    BigDecimal sumExpense();

    // Sum by type and date range
    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.type = :type AND t.date BETWEEN :start AND :end")
    BigDecimal sumByTypeAndDateRange(@Param("type") TransactionType type,
                                    @Param("start") LocalDate start,
                                    @Param("end") LocalDate end);

    // Expense grouped by category
    @Query("SELECT t.category, SUM(t.amount) FROM Transaction t WHERE t.type = 'EXPENSE' GROUP BY t.category")
    List<Object[]> sumExpenseByCategory();

    // Income grouped by category
    @Query("SELECT t.category, SUM(t.amount) FROM Transaction t WHERE t.type = 'INCOME' GROUP BY t.category")
    List<Object[]> sumIncomeByCategory();

    // Count by type
    long countByType(TransactionType type);

    // Search by description
    List<Transaction> findByDescriptionContainingIgnoreCaseOrderByDateDesc(String keyword);

    List<Transaction> findByUserIdOrderByDateDesc(Long userId);

    Optional<Transaction> findByIdAndUserId(Long id, Long userId);

    List<Transaction> findByUserIdAndTypeOrderByDateDesc(
            Long userId,
            TransactionType type
    );

    List<Transaction> findByUserIdAndDateBetweenOrderByDateDesc(
            Long userId,
            LocalDate startDate,
            LocalDate endDate
    );

    List<Transaction>
    findByUserIdAndTypeAndDateBetweenOrderByDateDesc(
            Long userId,
            TransactionType type,
            LocalDate startDate,
            LocalDate endDate
    );

    List<Transaction>
    findByUserIdAndDescriptionContainingIgnoreCaseOrderByDateDesc(
            Long userId,
            String keyword
    );

    @Query("""
    SELECT COALESCE(SUM(t.amount), 0)
    FROM Transaction t
    WHERE t.user.id = :userId AND t.type = :type
    """)
    BigDecimal sumByUserIdAndType(
            @Param("userId") Long userId,
            @Param("type") TransactionType type);

    @Query("""
    SELECT t.category, SUM(t.amount)
    FROM Transaction t
    WHERE t.user.id = :userId AND t.type = :type
    GROUP BY t.category
    """)
    List<Object[]> sumByUserIdAndTypeGroupedByCategory(
            @Param("userId") Long userId,
            @Param("type") TransactionType type);

    long countByUserIdAndType(Long userId, TransactionType type);
}
