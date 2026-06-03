import EmptyState from "../components/EmptyState";
import Loading from "../components/Loading";
import CourseCard from "../components/CourseCard";

function Courses({ loading, courses }) {
    if (loading) {
        return (
            <div className="courses-list">
                <Loading />
            </div>
        );
    }

    if (courses.length === 0) {
        return (
            <div className="courses-list">
                <EmptyState />
            </div>
        );
    }

    const groupedCourses = courses.reduce((acc, course) => {
        const day = course.day !== undefined && course.day >= 0 && course.day <= 6 ? course.day : 7;
        if (!acc[day]) acc[day] = [];
        acc[day].push(course);
        return acc;
    }, {});

    const dayNames = {
        0: "日曜日",
        1: "月曜日",
        2: "火曜日",
        3: "水曜日",
        4: "木曜日",
        5: "金曜日",
        6: "土曜日",
        7: "特設コース",
    };

    const dayOrder = [1, 2, 3, 4, 5, 6, 0, 7];
    const activeDays = dayOrder.filter((day) => groupedCourses[day] && groupedCourses[day].length > 0);

    return (
        <div className="courses-list-grouped">
            {activeDays.map((day, dayIndex) => (
                <div key={day} className="day-section">
                    <h2 className="day-header">{dayNames[day]}</h2>
                    <div className="day-courses">
                        {groupedCourses[day].map((course, index) => (
                            <CourseCard key={index} course={course} dayIndex={dayIndex} index={index} />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

export default Courses;
