package vn.edu.iuh.fit.enums;

import lombok.Getter;

@Getter
public enum Reaction {
    LIKE(1, "like"),
    LOVE(2, "love"),
    HAHA(3, "haha"),
    WOW(4, "wow"),
    SAD(5, "sad"),
    ANGRY(6, "angry");

    private int id;

    private String name;

    private Reaction(int id, String name) {
        this.id = id;
        this.name = name;
    }

    public static Reaction fromId(int id) {
        for (Reaction reaction : Reaction.values()) {
            if (reaction.id == id) {
                return reaction;
            }
        }
        throw new IllegalArgumentException("No Reaction found for id: " + id);
    }

    public static Reaction fromName(String name) {
        for (Reaction reaction : Reaction.values()) {
            if (reaction.name.equalsIgnoreCase(name)) {
                return reaction;
            }
        }
        throw new IllegalArgumentException("No Reaction found for name: " + name);
    }

}
