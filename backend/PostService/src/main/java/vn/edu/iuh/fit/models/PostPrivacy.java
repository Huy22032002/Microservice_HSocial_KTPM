package vn.edu.iuh.fit.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import vn.edu.iuh.fit.enums.Privacy;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class PostPrivacy {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long postPrivacyId;

    @Enumerated(EnumType.ORDINAL)
    private Privacy privacy;


}
