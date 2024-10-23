package com.example.dailyLog.dto.response;

import com.example.dailyLog.constant.Color;
import lombok.Builder;
import lombok.Getter;
import java.time.LocalDateTime;

@Builder
@Getter
public class ScheduleResponseYearDto {

        private LocalDateTime start;

        private Color color;
}
