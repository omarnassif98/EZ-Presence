import 'package:json_annotation/json_annotation.dart';

part 'attendance.g.dart';

@JsonSerializable()
class Attendance {
  Attendance(this.sessionId, this.teacherId, this.classId, this.latitude,
      this.longitude);

  @JsonKey(name: 'session_id')
  String sessionId;

  @JsonKey(name: 'teacher_id')
  String teacherId;

  @JsonKey(name: 'class_id')
  String classId;

  double latitude;

  double longitude;

  factory Attendance.fromJson(Map<String, dynamic> json) =>
      _$AttendanceFromJson(json);

  Map<String, dynamic> toJson() => _$AttendanceToJson(this);
}
