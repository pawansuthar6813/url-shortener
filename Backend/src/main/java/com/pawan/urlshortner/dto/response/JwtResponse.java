
package com.pawan.urlshortner.dto.response;

import com.pawan.urlshortner.model.Role;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class JwtResponse {
    private String token;
    private String type = "Bearer";
    private String refreshToken;
    private String id;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private Set<Role> roles;

    public JwtResponse(String token, String refreshToken, String id, String username,
                       String email, String firstName, String lastName, Set<Role> roles) {
        this.token = token;
        this.refreshToken = refreshToken;
        this.id = id;
        this.username = username;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.roles = roles;
    }
}