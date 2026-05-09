package com.tripplanner.backend;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/trains")
@CrossOrigin(origins = "*")
public class TrainController {

    @Autowired
    private TrainRepository trainRepository;

    @PostMapping("/add")
    public Train addTrain(@RequestBody Train train) {
        return trainRepository.save(train);
    }

    @GetMapping("/search")
    public List<Map<String, Object>> searchTrains(
            @RequestParam String from,
            @RequestParam String to) {

        List<Train> allTrains = trainRepository.findAll();
        if (allTrains.isEmpty()) return new ArrayList<>();

        Collections.shuffle(allTrains);
        int count = new Random().nextInt(6) + 3;
        count = Math.min(count, allTrains.size());

        String[] times = {"06:00", "07:30", "09:00", "11:30",
                          "13:00", "15:30", "17:00", "19:30", "21:00", "22:30"};
        Collections.shuffle(Arrays.asList(times));

        double basePrice = 300 + (from.length() + to.length()) * 20;

        List<Map<String, Object>> result = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            Train train = allTrains.get(i);
            Map<String, Object> info = new HashMap<>();
            info.put("id", train.getId());
            info.put("trainName", train.getTrainName());
            info.put("trainNumber", train.getTrainNumber());
            info.put("trainType", train.getTrainType());
            info.put("from", from);
            info.put("to", to);
            info.put("departureTime", times[i % times.length]);
            info.put("price", Math.round(basePrice + new Random().nextInt(500)));
            info.put("availableSeats", new Random().nextInt(50) + 10);
            info.put("duration", (3 + new Random().nextInt(8)) + "h " + (new Random().nextInt(60)) + "m");
            result.add(info);
        }

        result.sort((a, b) -> ((String) a.get("departureTime"))
                .compareTo((String) b.get("departureTime")));

        return result;
    }
}