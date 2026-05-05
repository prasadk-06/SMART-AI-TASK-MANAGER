import List "mo:core/List";
import TaskLib "../lib/tasks";
import Types "../types/tasks";

mixin (tasks : List.List<Types.Task>) {

  public shared query ({ caller }) func getTasks() : async [Types.Task] {
    TaskLib.getTasksForUser(tasks, caller);
  };

  public shared ({ caller }) func createTask(
    input : Types.CreateTaskInput
  ) : async { #ok : Types.Task; #err : Text } {
    #ok(TaskLib.createTask(tasks, caller, input));
  };

  public shared ({ caller }) func updateTask(
    input : Types.UpdateTaskInput
  ) : async { #ok : Types.Task; #err : Text } {
    switch (TaskLib.updateTask(tasks, caller, input)) {
      case (?task) { #ok(task) };
      case null { #err("Task not found") };
    };
  };

  public shared ({ caller }) func deleteTask(
    taskId : Text
  ) : async { #ok : (); #err : Text } {
    if (TaskLib.deleteTask(tasks, caller, taskId)) { #ok(()) }
    else { #err("Task not found") };
  };

  public shared ({ caller }) func markComplete(
    taskId : Text
  ) : async { #ok : Types.Task; #err : Text } {
    switch (TaskLib.markComplete(tasks, caller, taskId)) {
      case (?task) { #ok(task) };
      case null { #err("Task not found") };
    };
  };

  public shared ({ caller }) func markIncomplete(
    taskId : Text
  ) : async { #ok : Types.Task; #err : Text } {
    switch (TaskLib.markIncomplete(tasks, caller, taskId)) {
      case (?task) { #ok(task) };
      case null { #err("Task not found") };
    };
  };

  public shared ({ caller }) func updateTaskOrder(
    entries : [Types.TaskOrderEntry]
  ) : async { #ok : (); #err : Text } {
    if (TaskLib.updateTaskOrder(tasks, caller, entries)) { #ok(()) }
    else { #err("Reorder failed") };
  };

};
