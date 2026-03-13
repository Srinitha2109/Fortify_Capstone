package com.example.comproject.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.*;

class FileStorageServiceTest {

    @TempDir
    Path tempDir;

    @Test
    void testStoreFile() throws Exception {
        // We can't easily mock the constructor's default path without refactoring
        // but we can test the logic if we were to inject the path.
        // For now, let's just ensure the service can be instantiated.
        FileStorageService service = new FileStorageService();
        assertNotNull(service);

        MultipartFile file = new MockMultipartFile("file", "test.txt", "text/plain", "hello".getBytes());
        String storedName = service.storeFile(file);
        
        assertNotNull(storedName);
        assertTrue(storedName.contains("test.txt"));
    }
}
