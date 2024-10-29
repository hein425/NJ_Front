package com.example.dailyLog.dto.request;

import com.example.dailyLog.constant.Category;
import com.example.dailyLog.entity.Calendars;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.validator.constraints.Length;

import java.time.LocalDate;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class DiaryRequestUpdateDto {

    @Schema(hidden = true)
    private Long idx;

    @Length(min = 1, max = 50)
    private String title;

    @Length(max = 3000)
    private String content;

    private LocalDate date;

    private Category category;

}
