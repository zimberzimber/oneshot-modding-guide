SCRIPTS_ROOT = "scripts"

list_path = File.join(SCRIPTS_ROOT, "_scripts.txt")
IO.foreach(list_path) do |name|
  name.strip!
  next if name.empty? || name.start_with?("#")
  puts "Loading #{name}"

  require_relative "#{SCRIPTS_ROOT}/#{name}"
end