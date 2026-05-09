package com.tripplanner.backend;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/buses")
@CrossOrigin(origins = "*")
public class BusController {

    @Autowired
    private BusRepository busRepository;

    @PostMapping("/add")
    public Bus addBus(@RequestBody Bus bus) {
        return busRepository.save(bus);
    }

    @GetMapping("/search")
    public List<Map<String, Object>> searchBuses(
            @RequestParam String from,
            @RequestParam String to) {

        List<Bus> allBuses = busRepository.findAll();
        Collections.shuffle(allBuses);

        int count = new Random().nextInt(11) + 5;
        count = Math.min(count, allBuses.size());

        List<Map<String, Object>> result = new ArrayList<>();

        String[] times = {"06:00", "07:30", "08:00", "09:15", "10:30",
                          "11:00", "12:30", "14:00", "15:30", "17:00",
                          "18:30", "20:00", "21:30", "22:00", "23:00"};

        Collections.shuffle(Arrays.asList(times));

        double basePrice = 200 + (from.length() + to.length()) * 15;

        for (int i = 0; i < count; i++) {
            Bus bus = allBuses.get(i);
            Map<String, Object> busInfo = new HashMap<>();
            busInfo.put("id", bus.getId());
            busInfo.put("busName", bus.getBusName());
            busInfo.put("busType", bus.getBusType());
            busInfo.put("from", from);
            busInfo.put("to", to);
            busInfo.put("departureTime", times[i % times.length]);
            busInfo.put("price", Math.round(basePrice + new Random().nextInt(300)));
            busInfo.put("availableSeats", new Random().nextInt(30) + 5);
            result.add(busInfo);
        }

        result.sort((a, b) -> ((String) a.get("departureTime"))
                .compareTo((String) b.get("departureTime")));

        return result;
    }
}