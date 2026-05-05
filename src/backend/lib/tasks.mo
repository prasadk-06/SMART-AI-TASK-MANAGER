import Array "mo:core/Array";
import Int "mo:core/Int";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Types "../types/tasks";

module {
  public type Task = Types.Task;
  public type CreateTaskInput = Types.CreateTaskInput;
  public type UpdateTaskInput = Types.UpdateTaskInput;
  public type TaskOrderEntry = Types.TaskOrderEntry;

  // Generate a unique ID from timestamp + a counter component
  func genId(now : Int, size : Nat) : Text {
    now.toText() # "-" # size.toText();
  };

  public func getTasksForUser(
    tasks : List.List<Task>,
    userId : Principal,
  ) : [Task] {
    let filtered = tasks.filter(func(t : Task) : Bool {
      t.userId == userId
    });
    let arr = filtered.toArray();
    arr.sort(func(a : Task, b : Task) : { #less; #equal; #greater } {
      Nat.compare(a.order, b.order)
    });
  };

  public func createTask(
    tasks : List.List<Task>,
    userId : Principal,
    input : CreateTaskInput,
  ) : Task {
    let now = Time.now();
    let userTasks = tasks.filter(func(t : Task) : Bool { t.userId == userId });
    let maxOrder = userTasks.foldLeft(
      0 : Nat,
      func(acc : Nat, t : Task) : Nat {
        if (t.order > acc) t.order else acc
      },
    );
    let task : Task = {
      id = genId(now, tasks.size());
      userId;
      title = input.title;
      description = input.description;
      dueDate = input.dueDate;
      priority = input.priority;
      tags = input.tags;
      status = #Pending;
      order = maxOrder + 1;
      createdAt = now;
      updatedAt = now;
    };
    tasks.add(task);
    task;
  };

  public func updateTask(
    tasks : List.List<Task>,
    userId : Principal,
    input : UpdateTaskInput,
  ) : ?Task {
    var found : ?Task = null;
    tasks.mapInPlace(func(t : Task) : Task {
      if (t.id == input.id and t.userId == userId) {
        let updated : Task = {
          t with
          title = input.title;
          description = input.description;
          dueDate = input.dueDate;
          priority = input.priority;
          tags = input.tags;
          updatedAt = Time.now();
        };
        found := ?updated;
        updated;
      } else {
        t;
      };
    });
    found;
  };

  public func deleteTask(
    tasks : List.List<Task>,
    userId : Principal,
    taskId : Text,
  ) : Bool {
    let sizeBefore = tasks.size();
    let kept = tasks.filter(func(t : Task) : Bool {
      not (t.id == taskId and t.userId == userId)
    });
    tasks.clear();
    tasks.append(kept);
    tasks.size() < sizeBefore;
  };

  func toggleStatus(
    tasks : List.List<Task>,
    userId : Principal,
    taskId : Text,
    newStatus : Types.Status,
  ) : ?Task {
    var found : ?Task = null;
    tasks.mapInPlace(func(t : Task) : Task {
      if (t.id == taskId and t.userId == userId) {
        let updated : Task = { t with status = newStatus; updatedAt = Time.now() };
        found := ?updated;
        updated;
      } else {
        t;
      };
    });
    found;
  };

  public func markComplete(
    tasks : List.List<Task>,
    userId : Principal,
    taskId : Text,
  ) : ?Task {
    toggleStatus(tasks, userId, taskId, #Completed);
  };

  public func markIncomplete(
    tasks : List.List<Task>,
    userId : Principal,
    taskId : Text,
  ) : ?Task {
    toggleStatus(tasks, userId, taskId, #Pending);
  };

  public func updateTaskOrder(
    tasks : List.List<Task>,
    userId : Principal,
    entries : [TaskOrderEntry],
  ) : Bool {
    tasks.mapInPlace(func(t : Task) : Task {
      if (t.userId == userId) {
        switch (entries.find(func(e : TaskOrderEntry) : Bool { e.id == t.id })) {
          case (?entry) { { t with order = entry.order; updatedAt = Time.now() } };
          case null { t };
        };
      } else {
        t;
      };
    });
    true;
  };
};
