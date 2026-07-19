package com.water.monitoring_and_billing_platform.service;

import com.water.monitoring_and_billing_platform.entity.Community;
import com.water.monitoring_and_billing_platform.repository.BillRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class BillNumberGenerator {

    private final BillRepository billRepository;

    public synchronized String generateBillNumber(Community community, LocalDate date) {
        String yearMonth = date.format(DateTimeFormatter.ofPattern("yyyyMM"));
        
        String prefix = "BILL-" + yearMonth + "-";
        
        long count = billRepository.countByBillNumberStartingWith(prefix);
        long nextSequence = count + 1;
        
        String billNumber;
        do {
            billNumber = String.format("%s%06d", prefix, nextSequence++);
        } while (billRepository.existsByBillNumber(billNumber));
        
        return billNumber;
    }
}
