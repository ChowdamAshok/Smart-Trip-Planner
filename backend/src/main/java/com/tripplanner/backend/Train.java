package com.tripplanner.backend;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "trains")
public class Train {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String trainName;

    @Column(nullable = false)
    private String trainNumber;

    @Column(nullable = false)
    private String trainType;

    @Column(nullable = false)
    private Integer totalSeats;
}