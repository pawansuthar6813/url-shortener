
package com.pawan.urlshortner.dto.request;

import lombok.Data;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

@Data
public class UpdateUserRequest {
    @Size(min = 3, max = 20, message = "Username must be between 3 and 20 characters")
    private String username;

    @Email(message = "Email should be valid")
    private String email;

    private String firstName;

    private String lastName;

    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;
}