package com.university.universitylibrarysystem.entity;

import jakarta.persistence.*;   // Provides JPA annotations for database mapping
import java.time.LocalDate;

/**
 * Represents a single book record in the library database.
 * 
 * Each Book object corresponds to a row in the "books" table.
 * 
 * Example:
 *  - title: "Introduction to Algorithms"
package com.university.universitylibrarysystem.entity;
 *  - isbn: "9780262033848"
 *  - availableCopies: 5
 */
@Entity                     // Marks this class as a JPA entity (table)
@Table(name = "books")      // Specifies the table name in the database
public class Book {

    // =============== Primary Key ===============
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Auto-increment primary key
    private Long id;

    // =============== Columns ===============
    @Column(nullable = false) // Cannot be null in the database
    private String title;

    @Column(nullable = false)
    private String author;

    @Column(unique = true, nullable = false)
    private String isbn; // International Standard Book Number (unique ID for books)

    private String publisher;
    private LocalDate publicationDate;
    private Integer publicationYear;
    private String category;
    private String locationCode;
    private String rfidTag;
    private String description;
    private String coverImageUrl;
    private int totalCopies;
    private int availableCopies;
    private int totalBorrows;
    // private Integer condition; // 1-10 rating - Column may not exist in DB yet
    private String notes;

    // =============== Constructors ===============

    // Default constructor (required by JPA)
    public Book() {}

    // Constructor to quickly create a book
    public Book(String title, String author, String isbn, String publisher,
                LocalDate publicationDate, int totalCopies, int availableCopies) {
        this.title = title;
        this.author = author;
        this.isbn = isbn;
        this.publisher = publisher;
        this.publicationDate = publicationDate;
        this.totalCopies = totalCopies;
        this.availableCopies = availableCopies;
    }

    // =============== Getters and Setters ===============
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getAuthor() { return author; }
    public void setAuthor(String author) { this.author = author; }

    public String getIsbn() { return isbn; }
    public void setIsbn(String isbn) { this.isbn = isbn; }

    public String getPublisher() { return publisher; }
    public void setPublisher(String publisher) { this.publisher = publisher; }

    public LocalDate getPublicationDate() { return publicationDate; }
    public void setPublicationDate(LocalDate publicationDate) { this.publicationDate = publicationDate; }

    public Integer getPublicationYear() { return publicationYear; }
    public void setPublicationYear(Integer publicationYear) { this.publicationYear = publicationYear; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getLocationCode() { return locationCode; }
    public void setLocationCode(String locationCode) { this.locationCode = locationCode; }

    public String getRfidTag() { return rfidTag; }
    public void setRfidTag(String rfidTag) { this.rfidTag = rfidTag; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCoverImageUrl() { return coverImageUrl; }
    public void setCoverImageUrl(String coverImageUrl) { this.coverImageUrl = coverImageUrl; }

    public int getTotalCopies() { return totalCopies; }
    public void setTotalCopies(int totalCopies) { this.totalCopies = totalCopies; }

    public int getAvailableCopies() { return availableCopies; }
    public void setAvailableCopies(int availableCopies) { this.availableCopies = availableCopies; }

    public int getTotalBorrows() { return totalBorrows; }
    public void setTotalBorrows(int totalBorrows) { this.totalBorrows = totalBorrows; }

    // public Integer getCondition() { return condition; }
    // public void setCondition(Integer condition) { this.condition = condition; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    // =============== Helper Methods ===============

    /**
     * Reduces available copies when a book is borrowed.
     */
    public void borrowBook() {
        if (availableCopies > 0) {
            availableCopies--;
        }
    }

    /**
     * Increases available copies when a book is returned.
     */
    public void returnBook() {
        availableCopies++;
    }
}
