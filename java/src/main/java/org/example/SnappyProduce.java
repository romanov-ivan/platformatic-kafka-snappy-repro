package org.example;

import org.xerial.snappy.SnappyOutputStream;

import java.io.IOException;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;

public final class SnappyProduce {
    private SnappyProduce() {
    }

    public static void main(String[] args) throws IOException {
        if (args.length != 1) {
            throw new IllegalArgumentException("Expected output path as the only argument");
        }

        final byte[] payload = "hello world".getBytes(StandardCharsets.UTF_8);
        final Path output = Path.of(args[0]);

        Files.createDirectories(output.getParent());

        try (OutputStream file = Files.newOutputStream(output);
             SnappyOutputStream snappy = new SnappyOutputStream(file)) {
            snappy.write(payload);
        }
    }
}
