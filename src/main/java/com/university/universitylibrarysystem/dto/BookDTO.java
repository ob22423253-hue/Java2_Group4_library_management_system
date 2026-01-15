package com.university.universitylibrarysystem.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

/**
 * Data Transfer Object for Book entity.
 * Used for creating and updating books.
 */
@Data
public class BookDTO {
    
    private Long id;

    @NotBlank(message = "Title is required")
    @Size(max = 255, message = "Title must not exceed 255 characters")
    private String title;

    @NotBlank(message = "Author is required")
    @Size(max = 255, message = "Author name must not exceed 255 characters")
    private String author;

    @NotBlank(message = "ISBN is required")
    @Pattern(regexp = "^(?:ISBN(?:-1[03])?:? )?(?=[0-9X]{10}$|(?=(?:[0-9]+[- ]){3})[- 0-9X]{13}$|97[89][0-9]{10}$|(?=(?:[0-9]+[- ]){4})[- 0-9]{17}$)(?:97[89][- ])?[0-9]{1,5}[- ]?[0-9]+[- ]?[0-9]+[- ]?[0-9X]$",
            message = "Invalid ISBN format")
    private String isbn;

    @NotBlank(message = "Category is required")
    private String category;

    @NotNull(message = "Publication year is required")
    @Min(value = 1000, message = "Invalid publication year")
    @Max(value = 9999, message = "Invalid publication year")
    private Integer publicationYear;

    @NotBlank(message = "Publisher is required")
    private String publisher;

    @NotBlank(message = "Location code is required")
    @Pattern(regexp = "^[A-Z]{1,3}-\\d{1,3}$", 
            message = "Location code must be in format: XXX-999")
    private String locationCode;

    @NotNull(message = "Total copies is required")
    @Min(value = 1, message = "Must have at least one copy")
    private Integer totalCopies;

    private String rfidTag;

    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    private String description;

    private String coverImageUrl;

    private String notes;
}