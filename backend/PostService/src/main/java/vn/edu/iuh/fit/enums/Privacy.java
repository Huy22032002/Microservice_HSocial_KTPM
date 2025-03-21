package vn.edu.iuh.fit.enums;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public enum Privacy {
    PUBLIC(1, "Public"),
    FRIENDS(2, "Friends"),
    ONLY_ME(3, "Only Me");

    private int id;

    private String description;

    Privacy(int id, String description) {
        this.id = id;
        this.description = description;
    }

    public static Privacy fromId(int id) {
        for (Privacy privacy : Privacy.values()) {
            if (privacy.id == id) {
                return privacy;
            }
        }
        throw new IllegalArgumentException("No Privacy found for id: " + id);
    }

    public static Privacy fromDescription(String description) {
        for (Privacy privacy : Privacy.values()) {
            if (privacy.description.equalsIgnoreCase(description)) {
                return privacy;
            }
        }
        throw new IllegalArgumentException("No Privacy found for description: " + description);
    }
}
