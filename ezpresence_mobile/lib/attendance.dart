import 'package:json_annotation/json_annotation.dart';

part 'attendance.g.dart';

@JsonSerializable()
class Attendance {
  Attendance(this.session_id, this.teacher_id, this.class_id, this.latitude,
      this.longitude);

  String session_id;
  String teacher_id;
  String class_id;
  double latitude;
  double longitude;

  factory Attendance.fromJson(Map<String, dynamic> json) =>
      _$AttendanceFromJson(json);

  Map<String, dynamic> toJson() => _$AttendanceToJson(this);
}
