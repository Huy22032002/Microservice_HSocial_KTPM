package vn.edu.iuh.fit.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import vn.edu.iuh.fit.models.File;

public interface FileRepository extends JpaRepository<File, Long> , JpaSpecificationExecutor<File> {
  }